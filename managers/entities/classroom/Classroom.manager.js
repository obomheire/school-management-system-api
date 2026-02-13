const Classroom = require('./classroom.mongoModel');
const School = require('../school/school.mongoModel');
const CONSTANTS = require('../../_common/constants');
const schoolAccessGuard = require('../../_common/schoolAccess.guard');

module.exports = class ClassroomManager {
    constructor({ config, managers, validators }) {
        this.config = config;
        this.managers = managers;
        this.validators = validators;

        this.httpExposed = [
            'post=createClassroom',
            'get=listClassrooms',
            'get=getClassroom',
            'post=updateClassroom',
            'post=deleteClassroom'
        ];
    }

    async createClassroom({ __token, __role, __schoolScope, __params, __query, schoolId, name, roomNumber, gradeLevel, capacity, resources }) {
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

            // Verify school exists
            const school = await School.findById(targetSchoolId);
            if (!school) {
                return { errors: ['School not found'] };
            }

            // Create classroom
            const classroom = new Classroom({
                name,
                roomNumber,
                school: targetSchoolId,
                gradeLevel,
                capacity,
                resources: resources || [],
                status: CONSTANTS.CLASSROOM_STATUS.ACTIVE
            });

            await classroom.save();

            return { classroom };

        } catch (error) {
            console.error('Create classroom error:', error);
            if (error.code === 11000) {
                return { errors: ['Room number already exists in this school'] };
            }
            return { errors: ['Failed to create classroom'] };
        }
    }

    async listClassrooms({ __token, __role, __schoolScope, __params, __query, schoolId }) {
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
                CONSTANTS.PAGINATION.MAX_LIMIT
            );
            const skip = (page - 1) * limit;

            const filter = { school: targetSchoolId };
            if (__query.status) {
                filter.status = __query.status;
            }
            if (__query.gradeLevel) {
                filter.gradeLevel = __query.gradeLevel;
            }

            const [classrooms, total] = await Promise.all([
                Classroom.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ roomNumber: 1 })
                    .lean(),
                Classroom.countDocuments(filter)
            ]);

            return {
                classrooms,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('List classrooms error:', error);
            return { errors: ['Failed to fetch classrooms'] };
        }
    }

    async getClassroom({ __token, __role, __schoolScope, __params, __query, schoolId, classroomId }) {
        try {
            const targetClassroomId = classroomId || (__params && (__params.classroomId || __params.id)) || (__query && (__query.classroomId || __query.id));
            const access = schoolAccessGuard.resolveManagedSchoolId({
                __role,
                __params,
                __query,
                schoolId,
                scopedSchoolId: __schoolScope && __schoolScope.schoolId,
            });
            if (access.error) return { errors: [access.error] };
            const targetSchoolId = access.schoolId;

            if (!targetClassroomId) {
                return { errors: ['Classroom ID is required'] };
            }

            const classroom = await Classroom.findOne({
                _id: targetClassroomId,
                school: targetSchoolId
            }).lean();

            if (!classroom) {
                return { errors: ['Classroom not found or access denied'] };
            }

            return { classroom };

        } catch (error) {
            console.error('Get classroom error:', error);
            return { errors: ['Failed to fetch classroom'] };
        }
    }

    async updateClassroom({ __token, __role, __schoolScope, __params, __query, schoolId, classroomId, name, capacity, resources, status }) {
        try {
            const targetClassroomId = classroomId || (__params && (__params.classroomId || __params.id)) || (__query && (__query.classroomId || __query.id));
            const access = schoolAccessGuard.resolveManagedSchoolId({
                __role,
                __params,
                __query,
                schoolId,
                scopedSchoolId: __schoolScope && __schoolScope.schoolId,
            });
            if (access.error) return { errors: [access.error] };
            const targetSchoolId = access.schoolId;

            if (!targetClassroomId) {
                return { errors: ['Classroom ID is required'] };
            }

            const classroom = await Classroom.findOne({
                _id: targetClassroomId,
                school: targetSchoolId
            });

            if (!classroom) {
                return { errors: ['Classroom not found or access denied'] };
            }

            if (name) classroom.name = name;
            if (capacity) classroom.capacity = capacity;
            if (resources) classroom.resources = resources;
            if (status) classroom.status = status;

            await classroom.save();

            return { classroom };

        } catch (error) {
            console.error('Update classroom error:', error);
            return { errors: ['Failed to update classroom'] };
        }
    }

    async deleteClassroom({ __token, __role, __schoolScope, __params, __query, schoolId, classroomId }) {
        try {
            const targetClassroomId = classroomId || (__params && (__params.classroomId || __params.id)) || (__query && (__query.classroomId || __query.id));
            const access = schoolAccessGuard.resolveManagedSchoolId({
                __role,
                __params,
                __query,
                schoolId,
                scopedSchoolId: __schoolScope && __schoolScope.schoolId,
            });
            if (access.error) return { errors: [access.error] };
            const targetSchoolId = access.schoolId;

            if (!targetClassroomId) {
                return { errors: ['Classroom ID is required'] };
            }

            const classroom = await Classroom.findOne({
                _id: targetClassroomId,
                school: targetSchoolId
            });

            if (!classroom) {
                return { errors: ['Classroom not found or access denied'] };
            }

            // Soft delete
            classroom.status = CONSTANTS.CLASSROOM_STATUS.INACTIVE;
            await classroom.save();

            return { message: 'Classroom deleted successfully' };

        } catch (error) {
            console.error('Delete classroom error:', error);
            return { errors: ['Failed to delete classroom'] };
        }
    }
};
