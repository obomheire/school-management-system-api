const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CONSTANTS = require('../../_common/constants');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [50, 'Username cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [CONSTANTS.PASSWORD.MIN_LENGTH, `Password must be at least ${CONSTANTS.PASSWORD.MIN_LENGTH} characters long`]
    },
    role: {
        type: String,
        enum: Object.values(CONSTANTS.ROLES),
        required: [true, 'Role is required']
    },
    assignedSchool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: false
    },
    key: {
        type: String,
        required: [true, 'User key is required'],
        unique: true
    },
    status: {
        type: String,
        enum: Object.values(CONSTANTS.USER_STATUS),
        default: CONSTANTS.USER_STATUS.ACTIVE
    }
}, {
    timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ key: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ assignedSchool: 1 });
userSchema.index({ status: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(CONSTANTS.PASSWORD.BCRYPT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords for authentication
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to get safe user object (without password)
userSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
};

module.exports = mongoose.model('User', userSchema);
