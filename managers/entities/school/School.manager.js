const School = require('./school.mongoModel');
const User = require('../user/user.mongoModel');
const CONSTANTS = require('../../_common/constants');

module.exports = class SchoolManager {
    constructor({ config, managers, validators, cache }) {
        this.config = config;
        this.managers = managers;
        this.validators = validators;
        this.cache = cache;

        this.httpExposed = [
            'post=createSchool',
            'get=listSchools',
            'get=getSchool',
            'post=updateSchool',
            'post=deleteSchool',
            'post=assignAdministrator'
        ];
    }

    /**
     * Create a new school (Superadmin only)
     */
    async createSchool({ __token, __role, name, address, contactInfo, metadata }) {
        try {
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
            await this.cache.key.set(`school:${school._id}`, JSON.stringify(school), 3600);

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
            const page = parseInt(__query.page) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
            const limit = Math.min(
                parseInt(__query.limit) || CONSTANTS.PAGINATION.DEFAULT_LIMIT,
                CONSTANTS.PAGINATION.MAX_LIMIT
            );
            const skip = (page - 1) * limit;

            const filter = {};
            if (__query.status) {
                filter.status = __query.status;
            }

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
     * Get single school by ID (Superadmin only)
     */
    async getSchool({ __token, __role, __params }) {
        try {
            const schoolId = __params.schoolId || __params.id;

            if (!schoolId) {
                return { errors: ['School ID is required'] };
            }

            // Try to get from cache first
            const cached = await this.cache.key.get(`school:${schoolId}`);
            if (cached) {
                return { school: JSON.parse(cached) };
            }

            const school = await School.findById(schoolId)
                .populate('administrators', 'username email role')
                .lean();

            if (!school) {
                return { errors: ['School not found'] };
            }

            // Cache the result
            await this.cache.key.set(`school:${schoolId}`, JSON.stringify(school), 3600);

            return { school };

        } catch (error) {
            console.error('Get school error:', error);
            return { errors: ['Failed to fetch school'] };
        }
    }

    /**
     * Update school (Superadmin only)
     */
    async updateSchool({ __token, __role, __params, name, address, contactInfo, status, metadata }) {
        try {
            const schoolId = __params.schoolId || __params.id;

            if (!schoolId) {
                return { errors: ['School ID is required'] };
            }

            const school = await School.findById(schoolId);

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
            await this.cache.key.del(`school:${schoolId}`);

            return { school };

        } catch (error) {
            console.error('Update school error:', error);
            return { errors: ['Failed to update school'] };
        }
    }

    /**
     * Delete school (Soft delete - set status to inactive)
     */
    async deleteSchool({ __token, __role, __params }) {
        try {
            const schoolId = __params.schoolId || __params.id;

            if (!schoolId) {
                return { errors: ['School ID is required'] };
            }

            const school = await School.findById(schoolId);

            if (!school) {
                return { errors: ['School not found'] };
            }

            // Soft delete
            school.status = CONSTANTS.SCHOOL_STATUS.INACTIVE;
            await school.save();

            // Invalidate cache
            await this.cache.key.del(`school:${schoolId}`);

            return { message: 'School deleted successfully' };

        } catch (error) {
            console.error('Delete school error:', error);
            return { errors: ['Failed to delete school'] };
        }
    }

    /**
     * Assign administrator to school
     */
    async assignAdministrator({ __token, __role, __params, adminId }) {
        try {
            const schoolId = __params.schoolId || __params.id;

            if (!schoolId || !adminId) {
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
            admin.assignedSchool = schoolId;
            await admin.save();

            // Add admin to school's administrators array
            const school = await School.findById(schoolId);
            if (!school) {
                return { errors: ['School not found'] };
            }

            await school.addAdministrator(adminId);

            // Invalidate cache
            await this.cache.key.del(`school:${schoolId}`);

            return { message: 'Administrator assigned successfully', school };

        } catch (error) {
            console.error('Assign administrator error:', error);
            return { errors: ['Failed to assign administrator'] };
        }
    }
};
