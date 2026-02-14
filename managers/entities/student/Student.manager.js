const mongoose = require('mongoose');
const Student = require('./student.mongoModel');
const Classroom = require('../classroom/classroom.mongoModel');
const School = require('../school/school.mongoModel');
const CONSTANTS = require('../../_common/constants');
const schoolAccessGuard = require('../../_common/schoolAccess.guard');

module.exports = class StudentManager {
  constructor({ config, managers, validators }) {
    this.config = config;
    this.managers = managers;
    this.validators = validators;

    this.httpExposed = [
      "post=enrollStudent",
      "get=listStudents",
      "get=listWithdrawnStudents",
      "get=getStudent",
      "get=getWithdrawnStudent",
      "post=updateStudent",
      "post=withdrawnStudent",
      "post=restoreStudent",
      "post=transferStudent",
    ];
  }

  _resolveStudentIdentifier({ studentId, __params, __query }) {
    return (
      (__params && (__params.studentId || __params.id)) ||
      (__query && (__query.studentId || __query.id)) ||
      studentId ||
      null
    );
  }

  _buildStudentFilter({ schoolId, identifier }) {
    if (!identifier) return null;
    const filter = { school: schoolId };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter.$or = [{ _id: identifier }, { studentId: identifier }];
      return filter;
    }
    filter.studentId = identifier;
    return filter;
  }

  async enrollStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    firstName,
    lastName,
    dateOfBirth,
    studentId,
    classroomId,
    guardianInfo,
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) {
        await session.abortTransaction();
        return { errors: [access.error] };
      }
      const targetSchoolId = access.schoolId;

      // Verify classroom belongs to this school
      const classroom = await Classroom.findOne({
        _id: classroomId,
        school: targetSchoolId,
      }).session(session);

      if (!classroom) {
        await session.abortTransaction();
        return {
          errors: ["Classroom not found or does not belong to this school"],
        };
      }

      // Check classroom capacity
      if (!classroom.hasSpace(1)) {
        await session.abortTransaction();
        return { errors: ["Classroom is at full capacity"] };
      }

      // Check if student ID already exists
      const existingStudent = await Student.findByStudentId(studentId);
      if (existingStudent) {
        await session.abortTransaction();
        return { errors: ["Student ID already exists"] };
      }

      // Create student
      const student = new Student({
        firstName,
        lastName,
        dateOfBirth,
        studentId,
        school: targetSchoolId,
        classroom: classroomId,
        guardianInfo,
        enrollmentDate: new Date(),
        status: CONSTANTS.STUDENT_STATUS.ACTIVE,
      });

      await student.save({ session });

      // Increment classroom enrollment
      await classroom.incrementEnrollment(1);

      await session.commitTransaction();

      return { student };
    } catch (error) {
      await session.abortTransaction();
      console.error("Enroll student error:", error);
      if (error.code === 11000) {
        return { errors: ["Student ID already exists"] };
      }
      return { errors: ["Failed to enroll student"] };
    } finally {
      session.endSession();
    }
  }

  async listStudents({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
  }) {
    try {
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) return { errors: [access.error] };
      const targetSchoolId = access.schoolId;

      const page = parseInt(__query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        parseInt(__query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
        CONSTANTS.PAGINATION.MAX_LIMIT,
      );
      const skip = (page - 1) * limit;

      const filter = {
        school: targetSchoolId,
        status: { $ne: CONSTANTS.STUDENT_STATUS.WITHDRAWN },
      };
      if (
        __query.status &&
        __query.status !== CONSTANTS.STUDENT_STATUS.WITHDRAWN
      ) {
        filter.status = __query.status;
      }
      if (__query.classroomId) {
        filter.classroom = __query.classroomId;
      }

      const [students, total] = await Promise.all([
        Student.find(filter)
          .skip(skip)
          .limit(limit)
          .populate("classroom", "name roomNumber gradeLevel")
          .sort({ lastName: 1, firstName: 1 })
          .lean(),
        Student.countDocuments(filter),
      ]);

      return {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("List students error:", error);
      return { errors: ["Failed to fetch students"] };
    }
  }

  async listWithdrawnStudents({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
  }) {
    try {
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) return { errors: [access.error] };
      const targetSchoolId = access.schoolId;

      const page = parseInt(__query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        parseInt(__query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
        CONSTANTS.PAGINATION.MAX_LIMIT,
      );
      const skip = (page - 1) * limit;

      const filter = {
        school: targetSchoolId,
        status: CONSTANTS.STUDENT_STATUS.WITHDRAWN,
      };
      if (__query.classroomId) {
        filter.classroom = __query.classroomId;
      }

      const [students, total] = await Promise.all([
        Student.find(filter)
          .skip(skip)
          .limit(limit)
          .populate("classroom", "name roomNumber gradeLevel")
          .sort({ updatedAt: -1 })
          .lean(),
        Student.countDocuments(filter),
      ]);

      return {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("List withdrawn students error:", error);
      return { errors: ["Failed to fetch withdrawn students"] };
    }
  }

  async getStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    studentId,
  }) {
    try {
      const targetStudentIdentifier = this._resolveStudentIdentifier({
        studentId,
        __params,
        __query,
      });
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) return { errors: [access.error] };
      const targetSchoolId = access.schoolId;

      if (!targetStudentIdentifier) {
        return { errors: ["Student ID is required"] };
      }

      const filter = this._buildStudentFilter({
        schoolId: targetSchoolId,
        identifier: targetStudentIdentifier,
      });

      const student = await Student.findOne(filter)
        .populate("school", "name address contactInfo")
        .populate("classroom", "name roomNumber gradeLevel capacity")
        .lean();

      if (!student || student.status === CONSTANTS.STUDENT_STATUS.WITHDRAWN) {
        return { errors: ["Student not found or access denied"] };
      }

      return { student };
    } catch (error) {
      console.error("Get student error:", error);
      return { errors: ["Failed to fetch student"] };
    }
  }

  async getWithdrawnStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    studentId,
  }) {
    try {
      const targetStudentIdentifier = this._resolveStudentIdentifier({
        studentId,
        __params,
        __query,
      });
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) return { errors: [access.error] };
      const targetSchoolId = access.schoolId;

      if (!targetStudentIdentifier) {
        return { errors: ["Student ID is required"] };
      }

      const filter = this._buildStudentFilter({
        schoolId: targetSchoolId,
        identifier: targetStudentIdentifier,
      });
      filter.status = CONSTANTS.STUDENT_STATUS.WITHDRAWN;

      const student = await Student.findOne(filter)
        .populate("school", "name address contactInfo")
        .populate("classroom", "name roomNumber gradeLevel capacity")
        .lean();

      if (!student) {
        return { errors: ["Withdrawn student not found or access denied"] };
      }

      return { student };
    } catch (error) {
      console.error("Get withdrawn student error:", error);
      return { errors: ["Failed to fetch withdrawn student"] };
    }
  }

  async updateStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    studentId,
    firstName,
    lastName,
    dateOfBirth,
    guardianInfo,
    status,
  }) {
    try {
      const targetStudentIdentifier = this._resolveStudentIdentifier({
        studentId,
        __params,
        __query,
      });
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) return { errors: [access.error] };
      const targetSchoolId = access.schoolId;

      if (!targetStudentIdentifier) {
        return { errors: ["Student ID is required"] };
      }

      const filter = this._buildStudentFilter({
        schoolId: targetSchoolId,
        identifier: targetStudentIdentifier,
      });

      const student = await Student.findOne(filter);

      if (!student) {
        return { errors: ["Student not found or access denied"] };
      }

      if (firstName) student.firstName = firstName;
      if (lastName) student.lastName = lastName;
      if (dateOfBirth) student.dateOfBirth = dateOfBirth;
      if (guardianInfo)
        student.guardianInfo = { ...student.guardianInfo, ...guardianInfo };
      if (status) student.status = status;

      await student.save();

      return { student };
    } catch (error) {
      console.error("Update student error:", error);
      return { errors: ["Failed to update student"] };
    }
  }

  async withdrawnStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    studentId,
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const targetStudentIdentifier = this._resolveStudentIdentifier({
        studentId,
        __params,
        __query,
      });
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) {
        await session.abortTransaction();
        return { errors: [access.error] };
      }
      const targetSchoolId = access.schoolId;

      if (!targetStudentIdentifier) {
        await session.abortTransaction();
        return { errors: ["Student ID is required"] };
      }

      const filter = this._buildStudentFilter({
        schoolId: targetSchoolId,
        identifier: targetStudentIdentifier,
      });

      const student = await Student.findOne(filter).session(session);

      if (!student) {
        await session.abortTransaction();
        return { errors: ["Student not found or access denied"] };
      }

      // Decrement classroom enrollment
      const classroom = await Classroom.findById(student.classroom).session(
        session,
      );
      if (classroom) {
        await classroom.decrementEnrollment(1);
      }

      // Soft delete student
      student.status = CONSTANTS.STUDENT_STATUS.WITHDRAWN;
      await student.save({ session });

      await session.commitTransaction();

      return { message: "Student withdrawn successfully" };
    } catch (error) {
      await session.abortTransaction();
      console.error("Delete student error:", error);
      return { errors: ["Failed to delete student"] };
    } finally {
      session.endSession();
    }
  }

  async restoreStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    studentId,
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const targetStudentIdentifier = this._resolveStudentIdentifier({
        studentId,
        __params,
        __query,
      });
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) {
        await session.abortTransaction();
        return { errors: [access.error] };
      }
      const targetSchoolId = access.schoolId;

      if (!targetStudentIdentifier) {
        await session.abortTransaction();
        return { errors: ["Student ID is required"] };
      }

      const filter = this._buildStudentFilter({
        schoolId: targetSchoolId,
        identifier: targetStudentIdentifier,
      });
      filter.status = CONSTANTS.STUDENT_STATUS.WITHDRAWN;

      const student = await Student.findOne(filter).session(session);
      if (!student) {
        await session.abortTransaction();
        return { errors: ["Withdrawn student not found or access denied"] };
      }

      const school = await School.findOne({
        _id: student.school,
        status: CONSTANTS.SCHOOL_STATUS.ACTIVE,
      })
        .session(session)
        .lean();
      if (!school) {
        await session.abortTransaction();
        return { errors: ["School not found or inactive"] };
      }

      const classroom = await Classroom.findOne({
        _id: student.classroom,
        school: student.school,
        status: CONSTANTS.CLASSROOM_STATUS.ACTIVE,
      }).session(session);
      if (!classroom) {
        await session.abortTransaction();
        return { errors: ["Classroom not found or inactive"] };
      }

      if ((classroom.currentEnrollment + 1) > classroom.capacity) {
        await session.abortTransaction();
        return { errors: ["Classroom is at full capacity"] };
      }

      classroom.currentEnrollment += 1;
      await classroom.save({ session });

      student.status = CONSTANTS.STUDENT_STATUS.ACTIVE;
      await student.save({ session });

      await session.commitTransaction();

      return { message: "Student restored successfully", student };
    } catch (error) {
      await session.abortTransaction();
      console.error("Restore student error:", error);
      return { errors: ["Failed to restore student"] };
    } finally {
      session.endSession();
    }
  }

  async transferStudent({
    __token,
    __role,
    __schoolScope,
    __params,
    __query,
    schoolId,
    studentId,
    targetSchoolId,
    targetClassroomId,
    reason,
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sourceStudentIdentifier = this._resolveStudentIdentifier({
        studentId,
        __params,
        __query,
      });
      const access = schoolAccessGuard.resolveManagedSchoolId({
        __role,
        __params,
        __query,
        schoolId,
        scopedSchoolId: __schoolScope && __schoolScope.schoolId,
      });
      if (access.error) {
        await session.abortTransaction();
        return { errors: [access.error] };
      }
      const currentSchoolId = access.schoolId;

      if (!sourceStudentIdentifier || !targetSchoolId || !targetClassroomId) {
        await session.abortTransaction();
        return {
          errors: [
            "Student ID, target school ID, and target classroom ID are required",
          ],
        };
      }

      if (__role && __role.role === CONSTANTS.ROLES.SCHOOL_ADMIN) {
        // Multi-school admin support: target school must also be assigned to the same admin.
        const targetAllowed = await School.findOne({
          _id: targetSchoolId,
          administrators: __role.userId,
          status: CONSTANTS.SCHOOL_STATUS.ACTIVE,
        })
          .select("_id")
          .lean();

        if (!targetAllowed) {
          await session.abortTransaction();
          return {
            errors: [
              "Access denied. You can only transfer students to schools assigned to you.",
            ],
          };
        }
      }

      // Fetch student
      const filter = this._buildStudentFilter({
        schoolId: currentSchoolId,
        identifier: sourceStudentIdentifier,
      });

      const student = await Student.findOne(filter).session(session);

      if (!student) {
        await session.abortTransaction();
        return { errors: ["Student not found or access denied"] };
      }

      // Verify target school exists
      const targetSchool =
        await School.findById(targetSchoolId).session(session);
      if (
        !targetSchool ||
        targetSchool.status !== CONSTANTS.SCHOOL_STATUS.ACTIVE
      ) {
        await session.abortTransaction();
        return { errors: ["Target school not found or inactive"] };
      }

      // Verify target classroom belongs to target school
      const targetClassroom = await Classroom.findOne({
        _id: targetClassroomId,
        school: targetSchoolId,
      }).session(session);

      if (!targetClassroom) {
        await session.abortTransaction();
        return {
          errors: [
            "Target classroom not found or does not belong to target school",
          ],
        };
      }

      // Check target classroom capacity
      if (!targetClassroom.hasSpace(1)) {
        await session.abortTransaction();
        return { errors: ["Target classroom is at full capacity"] };
      }

      // Get current classroom
      const currentClassroom = await Classroom.findById(
        student.classroom,
      ).session(session);

      // Update enrollment counts
      if (currentClassroom) {
        await currentClassroom.decrementEnrollment(1);
      }
      await targetClassroom.incrementEnrollment(1);

      // Add transfer record
      student.addTransferRecord(
        currentSchoolId,
        targetSchoolId,
        student.classroom,
        targetClassroomId,
        reason,
      );

      // Update student's school and classroom
      student.school = targetSchoolId;
      student.classroom = targetClassroomId;
      student.status = CONSTANTS.STUDENT_STATUS.TRANSFERRED;

      await student.save({ session });

      await session.commitTransaction();

      return {
        message: "Student transferred successfully",
        student,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Transfer student error:", error);
      return { errors: ["Failed to transfer student"] };
    } finally {
      session.endSession();
    }
  }
};
