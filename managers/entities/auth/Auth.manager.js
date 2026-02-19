const { nanoid } = require('nanoid');
const User = require('../user/user.mongoModel');
const School = require('../school/school.mongoModel');
const CONSTANTS = require('../../_common/constants');
const rbacHelper = require('../../_common/rbac.helper');

module.exports = class AuthManager {
    constructor({ config, managers, validators }) {
        this.config = config;
        this.managers = managers;
        this.validators = validators;

        this.httpExposed = [
            'post=register',
            'post=login',
            'get=getProfile'
        ];
    }

    /**
     * Register a new user
     */
    async register({ username, email, password, role, assignedSchool }) {
        try {
            // Validate role
            if (!rbacHelper.isValidRole(role)) {
                return { errors: ['Invalid role'] };
            }

            // Check if school assignment is required
            if (rbacHelper.requiresSchoolAssignment(role) && !assignedSchool) {
                return { errors: ['School Admin must be assigned to a school'] };
            }

            // If school is assigned, verify it exists
            if (assignedSchool) {
                const school = await School.findById(assignedSchool);
                if (!school) {
                    return { errors: ['Assigned school not found'] };
                }
                if (school.status !== CONSTANTS.SCHOOL_STATUS.ACTIVE) {
                    return { errors: ['Assigned school is not active'] };
                }
            }

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email: email.toLowerCase() }, { username }]
            });

            if (existingUser) {
                if (existingUser.email === email.toLowerCase()) {
                    return { errors: ['Email already registered'] };
                }
                if (existingUser.username === username) {
                    return { errors: ['Username already taken'] };
                }
            }

            // Generate unique key for token generation
            const userKey = nanoid(32);

            // Create new user
            const user = new User({
                username,
                email: email.toLowerCase(),
                password, // Will be hashed by pre-save hook
                role,
                assignedSchool: assignedSchool || undefined,
                key: userKey,
                status: CONSTANTS.USER_STATUS.ACTIVE
            });

            await user.save();

            // Generate long token for the user
            const longToken = this.managers.token.genLongToken({
                userId: user._id.toString(),
                userKey: userKey
            });

            // Return user data (without password) and long token
            const safeUser = user.toSafeObject();

            return {
                user: safeUser,
                longToken,
                code: 201,
            };

        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 11000) {
                return { errors: ['Email or username already exists'] };
            }
            return { errors: ['Registration failed. Please try again.'] };
        }
    }

    /**
     * Login user
     */
    async login({ email, password }) {
        try {
            // Find user by email
            const user = await User.findByEmail(email);

            if (!user) {
                return { errors: ['Invalid email or password'] };
            }

            // Check if user is active
            if (user.status !== CONSTANTS.USER_STATUS.ACTIVE) {
                return { errors: ['Account is inactive or suspended'] };
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return { errors: ['Invalid email or password'] };
            }

            // Generate long token
            const longToken = this.managers.token.genLongToken({
                userId: user._id.toString(),
                userKey: user.key
            });

            // Return user data (without password) and long token
            const safeUser = user.toSafeObject();

            return {
                user: safeUser,
                longToken
            };

        } catch (error) {
            console.error('Login error:', error);
            return { errors: ['Login failed. Please try again.'] };
        }
    }

    /**
     * Get user profile
     */
    async getProfile({ __token }) {
        try {
            if (!__token || !__token.userId) {
                return { errors: ['Authentication required'] };
            }

            // Fetch user from database
            const user = await User.findById(__token.userId)
                .populate('assignedSchool', 'name address contactInfo')
                .select('-password');

            if (!user) {
                return { errors: ['User not found'] };
            }

            return { user };

        } catch (error) {
            console.error('Get profile error:', error);
            return { errors: ['Failed to fetch profile'] };
        }
    }
};
