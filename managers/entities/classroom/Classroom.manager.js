const Classroom = require('./classroom.mongoModel');
const School = require('../school/school.mongoModel');
const CONSTANTS = require('../../_common/constants');

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

    async createClassroom({ __token, __schoolScope, name, roomNumber, gradeLevel, capacity, resources }) {
        try {
            // Use schoolId from middleware (enforces RBAC)
            const schoolId = __schoolScope.schoolId;

            // Verify school exists
            const school = await School.findById(schoolId);
            if (!school) {
                return { errors: ['School not found'] };
            }

            // Create classroom
            const classroom = new Classroom({
                name,
                roomNumber,
                school: schoolId,
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

    async listClassrooms({ __token, __schoolScope, __query }) {
        try {
            const schoolId = __schoolScope.schoolId;

            const page = parseInt(__query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
            const limit = Math.min(
                parseInt(__query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
                CONSTANTS.PAGINATION.MAX_LIMIT
            );
            const skip = (page - 1) * limit;

            const filter = { school: schoolId };
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

    async getClassroom({ __token, __schoolScope, __params }) {
        try {
            const classroomId = __params.classroomId || __params.id;
            const schoolId = __schoolScope.schoolId;

            if (!classroomId) {
                return { errors: ['Classroom ID is required'] };
            }

            const classroom = await Classroom.findOne({
                _id: classroomId,
                school: schoolId
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

    async updateClassroom({ __token, __schoolScope, __params, name, capacity, resources, status }) {
        try {
            const classroomId = __params.classroomId || __params.id;
            const schoolId = __schoolScope.schoolId;

            if (!classroomId) {
                return { errors: ['Classroom ID is required'] };
            }

            const classroom = await Classroom.findOne({
                _id: classroomId,
                school: schoolId
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

    async deleteClassroom({ __token, __schoolScope, __params }) {
        try {
            const classroomId = __params.classroomId || __params.id;
            const schoolId = __schoolScope.schoolId;

            if (!classroomId) {
                return { errors: ['Classroom ID is required'] };
            }

            const classroom = await Classroom.findOne({
                _id: classroomId,
                school: schoolId
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
