const School = require('./school.mongoModel');
const User = require('../user/user.mongoModel');
const Classroom = require('../classroom/classroom.mongoModel');
const Student = require('../student/student.mongoModel');
const CONSTANTS = require('../../_common/constants');
const rbacHelper = require('../../_common/rbac.helper');

module.exports = class SchoolManager {
    constructor({ config, managers, validators, cache }) {
        this.config = config;
        this.managers = managers;
        this.validators = validators;
        this.cache = cache;

        this.httpExposed = [
            'post=createSchool',
            'get=listSchools',
            'get=listDeletedSchools',
            'get=getSchool',
            'post=updateSchool',
            'post=deleteSchool',
            'post=restoreSchool',
            'post=permanentlyDeleteSchool',
            'post=assignAdministrator'
        ];
    }

    _requireRoleData(__role) {
        if (!__role || !__role.role) {
            return { errors: ['Authentication required'] };
        }
        return null;
    }

    _requireSuperadmin(__role) {
        const roleError = this._requireRoleData(__role);
        if (roleError) return roleError;
        if (!rbacHelper.isSuperadmin(__role.role)) {
            return { errors: ['Access denied. Superadmin role required'] };
        }
        return null;
    }

    _resolveRequestedSchoolId({ __params, __query, schoolId }) {
        return (
            schoolId ||
            (__params && (__params.schoolId || __params.id)) ||
            (__query && (__query.schoolId || __query.id)) ||
            null
        );
    }

    async _getActorFromToken(__token) {
        if (!__token || !__token.userId) return null;
        return User.findById(__token.userId).select('role assignedSchool status').lean();
    }

    /**
     * Create a new school (Superadmin only)
     */
    async createSchool({ __token, __role, name, address, contactInfo, metadata }) {
        try {
            const accessError = this._requireSuperadmin(__role);
            if (accessError) return accessError;

            // Check if school with same name exists
            const existing = await School.findByName(name);
            if (existing) {
                return { errors: ['School with this name already exists'] };
            }

            // Create school
            const school = new School({
                name,
                address,
                contactInfo,
                metadata: metadata || {},
                status: CONSTANTS.SCHOOL_STATUS.ACTIVE
            });

            await school.save();

            // Cache the school
            await this.cache.key.set({
                key: `school:${school._id}`,
                data: JSON.stringify(school),
                ttl: 3600,
            });

            return { school };

        } catch (error) {
            console.error('Create school error:', error);
            return { errors: ['Failed to create school'] };
        }
    }

    /**
     * List all schools with pagination (Superadmin only)
     */
    async listSchools({ __token, __role, __query }) {
        try {
            const actor = await this._getActorFromToken(__token);
            if (!actor || actor.status !== CONSTANTS.USER_STATUS.ACTIVE) {
                return { errors: ['Authentication required'] };
            }

            const page = parseInt(__query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
            const limit = Math.min(
                parseInt(__query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
                CONSTANTS.PAGINATION.MAX_LIMIT
            );
            const skip = (page - 1) * limit;

            if (rbacHelper.isSchoolAdmin(actor.role)) {
                const adminFilter = {
                    status: CONSTANTS.SCHOOL_STATUS.ACTIVE,
                    administrators: actor._id,
                };

                const [schools, total] = await Promise.all([
                    School.find(adminFilter)
                        .skip(skip)
                        .limit(limit)
                        .sort({ createdAt: -1 })
                        .lean(),
                    School.countDocuments(adminFilter),
                ]);

                return {
                    schools,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                };
            }

            if (!rbacHelper.isSuperadmin(actor.role)) {
                return { errors: ['Access denied'] };
            }

            const filter = { status: CONSTANTS.SCHOOL_STATUS.ACTIVE };

            const [schools, total] = await Promise.all([
                School.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .lean(),
                School.countDocuments(filter)
            ]);

            return {
                schools,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('List schools error:', error);
            return { errors: ['Failed to fetch schools'] };
        }
    }

    /**
     * List deleted schools in recycle bin (Superadmin only)
     */
    async listDeletedSchools({ __token, __role, __query }) {
        try {
            const accessError = this._requireSuperadmin(__role);
            if (accessError) return accessError;

            const page = parseInt(__query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
            const limit = Math.min(
                parseInt(__query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
                CONSTANTS.PAGINATION.MAX_LIMIT
            );
            const skip = (page - 1) * limit;

            const filter = { status: CONSTANTS.SCHOOL_STATUS.INACTIVE };

            const [schools, total] = await Promise.all([
                School.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ updatedAt: -1 })
                    .lean(),
                School.countDocuments(filter)
            ]);

            return {
                schools,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('List deleted schools error:', error);
            return { errors: ['Failed to fetch deleted schools'] };
        }
    }

    /**
     * Get single school by ID (Superadmin only)
     */
    async getSchool({ __token, __role, __params, __query, schoolId }) {
        try {
            const roleError = this._requireRoleData(__role);
            if (roleError) return roleError;

            const requestedSchoolId = this._resolveRequestedSchoolId({ __params, __query, schoolId });
            let targetSchoolId = requestedSchoolId;

            if (rbacHelper.isSchoolAdmin(__role.role)) {
                if (!__role.assignedSchool) {
                    return { errors: ['No school assigned to this administrator'] };
                }
                if (requestedSchoolId && requestedSchoolId !== __role.assignedSchool) {
                    return { errors: ['Access denied. You can only access your assigned school.'] };
                }
                targetSchoolId = __role.assignedSchool;
            } else if (!rbacHelper.isSuperadmin(__role.role)) {
                return { errors: ['Access denied'] };
            }

            if (!targetSchoolId) {
                return { errors: ['School ID is required'] };
            }

            // Try to get from cache first
            const cached = await this.cache.key.get({ key: `school:${targetSchoolId}` });
            if (cached) {
                const cachedSchool = JSON.parse(cached);
                if (cachedSchool.status === CONSTANTS.SCHOOL_STATUS.ACTIVE) {
                    return { school: cachedSchool };
                }
            }

            const school = await School.findOne({ _id: targetSchoolId, status: CONSTANTS.SCHOOL_STATUS.ACTIVE })
                .populate('administrators', 'username email role')
                .lean();

            if (!school) {
                return { errors: ['School not found'] };
            }

            // Cache the result
            await this.cache.key.set({
                key: `school:${targetSchoolId}`,
                data: JSON.stringify(school),
                ttl: 3600,
            });

            return { school };

        } catch (error) {
            console.error('Get school error:', error);
            return { errors: ['Failed to fetch school'] };
        }
    }

    /**
     * Update school (Superadmin only)
     */
    async updateSchool({ __token, __role, __params, __query, schoolId, name, address, contactInfo, status, metadata }) {
        try {
            const roleError = this._requireRoleData(__role);
            if (roleError) return roleError;

            const requestedSchoolId = this._resolveRequestedSchoolId({ __params, __query, schoolId });
            let targetSchoolId = requestedSchoolId;

            if (rbacHelper.isSchoolAdmin(__role.role)) {
                if (!__role.assignedSchool) {
                    return { errors: ['No school assigned to this administrator'] };
                }
                if (requestedSchoolId && requestedSchoolId !== __role.assignedSchool) {
                    return { errors: ['Access denied. You can only manage your assigned school.'] };
                }
                targetSchoolId = __role.assignedSchool;
            } else if (!rbacHelper.isSuperadmin(__role.role)) {
                return { errors: ['Access denied'] };
            }

            if (!targetSchoolId) {
                return { errors: ['School ID is required'] };
            }

            const school = await School.findById(targetSchoolId);

            if (!school) {
                return { errors: ['School not found'] };
            }

            // Update fields if provided
            if (name) school.name = name;
            if (address) school.address = { ...school.address, ...address };
            if (contactInfo) school.contactInfo = { ...school.contactInfo, ...contactInfo };
            if (status) school.status = status;
            if (metadata) school.metadata = { ...school.metadata, ...metadata };

            await school.save();

            // Invalidate cache
            await this.cache.key.delete({ key: `school:${targetSchoolId}` });

            return { school };

        } catch (error) {
            console.error('Update school error:', error);
            return { errors: ['Failed to update school'] };
        }
    }

    /**
     * Delete school (Soft delete - set status to inactive)
     */
    async deleteSchool({ __token, __role, __params, __query, schoolId }) {
        try {
            const accessError = this._requireSuperadmin(__role);
            if (accessError) return accessError;

            const targetSchoolId = this._resolveRequestedSchoolId({ __params, __query, schoolId });

            if (!targetSchoolId) {
                return { errors: ['School ID is required'] };
            }

            const school = await School.findById(targetSchoolId);

            if (!school) {
                return { errors: ['School not found'] };
            }

            // Soft delete
            school.status = CONSTANTS.SCHOOL_STATUS.INACTIVE;
            await school.save();

            // Invalidate cache
            await this.cache.key.delete({ key: `school:${targetSchoolId}` });

            return { message: 'School deleted successfully' };

        } catch (error) {
            console.error('Delete school error:', error);
            return { errors: ['Failed to delete school'] };
        }
    }

    /**
     * Restore school from recycle bin (inactive -> active)
     */
    async restoreSchool({ __token, __role, __params, __query, schoolId }) {
        try {
            const roleError = this._requireRoleData(__role);
            if (roleError) return roleError;

            const targetSchoolId = this._resolveRequestedSchoolId({ __params, __query, schoolId });

            if (!targetSchoolId) {
                return { errors: ['School ID is required'] };
            }

            const actor = await this._getActorFromToken(__token);
            if (!actor || actor.status !== CONSTANTS.USER_STATUS.ACTIVE) {
                return { errors: ['Authentication required'] };
            }

            let school = null;
            if (rbacHelper.isSuperadmin(actor.role)) {
                school = await School.findById(targetSchoolId);
            } else if (rbacHelper.isSchoolAdmin(actor.role)) {
                school = await School.findOne({
                    _id: targetSchoolId,
                    administrators: actor._id,
                });
            } else {
                return { errors: ['Access denied'] };
            }

            if (!school) {
                return { errors: ['School not found'] };
            }

            if (school.status !== CONSTANTS.SCHOOL_STATUS.INACTIVE) {
                return { errors: ['School is not in recycle bin'] };
            }

            school.status = CONSTANTS.SCHOOL_STATUS.ACTIVE;
            await school.save();

            await this.cache.key.delete({ key: `school:${targetSchoolId}` });

            return { message: 'School restored successfully', school };

        } catch (error) {
            console.error('Restore school error:', error);
            return { errors: ['Failed to restore school'] };
        }
    }

    /**
     * Permanently delete school from recycle bin (inactive schools only)
     */
    async permanentlyDeleteSchool({ __token, __role, __params, __query, schoolId }) {
        try {
            const accessError = this._requireSuperadmin(__role);
            if (accessError) return accessError;

            const targetSchoolId = this._resolveRequestedSchoolId({ __params, __query, schoolId });

            if (!targetSchoolId) {
                return { errors: ['School ID is required'] };
            }

            const school = await School.findById(targetSchoolId);

            if (!school) {
                return { errors: ['School not found'] };
            }

            if (school.status !== CONSTANTS.SCHOOL_STATUS.INACTIVE) {
                return { errors: ['School has not been deleted. Soft delete it first before permanent deletion.'] };
            }

            const [assignedAdminCount, classroomCount, studentCount] = await Promise.all([
                User.countDocuments({ assignedSchool: targetSchoolId, role: CONSTANTS.ROLES.SCHOOL_ADMIN }),
                Classroom.countDocuments({ school: targetSchoolId }),
                Student.countDocuments({ school: targetSchoolId }),
            ]);

            if (assignedAdminCount > 0 || classroomCount > 0 || studentCount > 0) {
                return {
                    errors: [
                        `Cannot permanently delete school with linked records (admins: ${assignedAdminCount}, classrooms: ${classroomCount}, students: ${studentCount}). Clean up dependencies first.`,
                    ],
                };
            }

            await School.deleteOne({ _id: targetSchoolId });
            await this.cache.key.delete({ key: `school:${targetSchoolId}` });

            return { message: 'School permanently deleted from recycle bin' };

        } catch (error) {
            console.error('Permanent delete school error:', error);
            return { errors: ['Failed to permanently delete school'] };
        }
    }

    /**
     * Assign administrator to school
     */
    async assignAdministrator({ __superadmin, __token, __role, __params, __query, schoolId, adminId }) {
        try {
            const accessError = this._requireSuperadmin(__role);
            if (accessError) return accessError;

            // Defense in depth: enforce superadmin role from persisted user record.
            if (!__token || !__token.userId) {
                return { errors: ['Authentication required'] };
            }
            const actor = await User.findById(__token.userId).select('role status').lean();
            if (!actor || actor.status !== CONSTANTS.USER_STATUS.ACTIVE || actor.role !== CONSTANTS.ROLES.SUPERADMIN) {
                return { errors: ['Access denied. Superadmin role required'] };
            }

            const targetSchoolId = this._resolveRequestedSchoolId({ __params, __query, schoolId });

            if (!targetSchoolId || !adminId) {
                return { errors: ['School ID and Admin ID are required'] };
            }

            // Verify admin exists and is a school_admin
            const admin = await User.findById(adminId);
            if (!admin) {
                return { errors: ['Administrator not found'] };
            }

            if (admin.role !== CONSTANTS.ROLES.SCHOOL_ADMIN) {
                return { errors: ['User must have school_admin role'] };
            }

            // Update admin's assigned school
            admin.assignedSchool = targetSchoolId;
            await admin.save();

            // Add admin to school's administrators array
            const school = await School.findById(targetSchoolId);
            if (!school) {
                return { errors: ['School not found'] };
            }

            await school.addAdministrator(adminId);

            // Invalidate cache
            await this.cache.key.delete({ key: `school:${targetSchoolId}` });

            return { message: 'Administrator assigned successfully', school };

        } catch (error) {
            console.error('Assign administrator error:', error);
            return { errors: ['Failed to assign administrator'] };
        }
    }
};
