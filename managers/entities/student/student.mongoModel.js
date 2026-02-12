const mongoose = require('mongoose');
const CONSTANTS = require('../../_common/constants');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9\-_]+$/, 'Student ID must be alphanumeric']
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'School reference is required'],
        index: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: [true, 'Classroom reference is required']
    },
    guardianInfo: {
        guardianName: {
            type: String,
            required: [true, 'Guardian name is required'],
            trim: true
        },
        relationship: {
            type: String,
            required: [true, 'Relationship is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Guardian phone is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Guardian email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid guardian email address']
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String
        }
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(CONSTANTS.STUDENT_STATUS),
        default: CONSTANTS.STUDENT_STATUS.ACTIVE
    },
    transferHistory: [{
        fromSchool: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        toSchool: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        fromClassroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom'
        },
        toClassroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom'
        },
        transferDate: {
            type: Date,
            default: Date.now
        },
        reason: String
    }]
}, {
    timestamps: true
});

// Indexes for performance
studentSchema.index({ school: 1, status: 1 });
studentSchema.index({ classroom: 1 });
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ 'guardianInfo.email': 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ enrollmentDate: -1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for age (approximate)
studentSchema.virtual('age').get(function() {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

// Static method to find students by school
studentSchema.statics.findBySchool = function(schoolId, filter = {}) {
    return this.find({ school: schoolId, ...filter });
};

// Static method to find students by classroom
studentSchema.statics.findByClassroom = function(classroomId, filter = {}) {
    return this.find({ classroom: classroomId, ...filter });
};

// Static method to find active students
studentSchema.statics.findActive = function(filter = {}) {
    return this.find({ ...filter, status: CONSTANTS.STUDENT_STATUS.ACTIVE });
};

// Static method to find student by studentId
studentSchema.statics.findByStudentId = function(studentId) {
    return this.findOne({ studentId });
};

// Method to add transfer record
studentSchema.methods.addTransferRecord = function(fromSchool, toSchool, fromClassroom, toClassroom, reason) {
    this.transferHistory.push({
        fromSchool,
        toSchool,
        fromClassroom,
        toClassroom,
        transferDate: new Date(),
        reason
    });
    return this;
};

// Method to check if student is active
studentSchema.methods.isActive = function() {
    return this.status === CONSTANTS.STUDENT_STATUS.ACTIVE;
};

// Method to get safe student object (with populated references)
studentSchema.methods.toDetailedObject = function() {
    return this.populate([
        { path: 'school', select: 'name address contactInfo' },
        { path: 'classroom', select: 'name roomNumber gradeLevel capacity currentEnrollment' }
    ]);
};

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
