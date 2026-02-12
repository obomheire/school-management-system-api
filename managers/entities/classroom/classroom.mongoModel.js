const mongoose = require('mongoose');
const CONSTANTS = require('../../_common/constants');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Classroom name is required'],
        trim: true
    },
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'School reference is required'],
        index: true
    },
    gradeLevel: {
        type: String,
        required: [true, 'Grade level is required'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [CONSTANTS.CLASSROOM.MIN_CAPACITY, `Capacity must be at least ${CONSTANTS.CLASSROOM.MIN_CAPACITY}`],
        max: [CONSTANTS.CLASSROOM.MAX_CAPACITY, `Capacity cannot exceed ${CONSTANTS.CLASSROOM.MAX_CAPACITY}`]
    },
    currentEnrollment: {
        type: Number,
        default: 0,
        min: [0, 'Current enrollment cannot be negative']
    },
    resources: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: Object.values(CONSTANTS.CLASSROOM_STATUS),
        default: CONSTANTS.CLASSROOM_STATUS.ACTIVE
    }
}, {
    timestamps: true
});

// Compound unique index: school + roomNumber must be unique
classroomSchema.index({ school: 1, roomNumber: 1 }, { unique: true });

// Additional indexes for performance
classroomSchema.index({ school: 1, status: 1 });
classroomSchema.index({ gradeLevel: 1 });
classroomSchema.index({ status: 1 });

// Virtual for available seats
classroomSchema.virtual('availableSeats').get(function() {
    return this.capacity - this.currentEnrollment;
});

// Virtual for is full
classroomSchema.virtual('isFull').get(function() {
    return this.currentEnrollment >= this.capacity;
});

// Virtual for utilization percentage
classroomSchema.virtual('utilizationPercentage').get(function() {
    return this.capacity > 0 ? Math.round((this.currentEnrollment / this.capacity) * 100) : 0;
});

// Pre-save validation: currentEnrollment cannot exceed capacity
classroomSchema.pre('save', function(next) {
    if (this.currentEnrollment > this.capacity) {
        next(new Error('Current enrollment cannot exceed capacity'));
    } else {
        next();
    }
});

// Static method to find classrooms by school
classroomSchema.statics.findBySchool = function(schoolId, filter = {}) {
    return this.find({ school: schoolId, ...filter });
};

// Static method to find active classrooms
classroomSchema.statics.findActive = function(filter = {}) {
    return this.find({ ...filter, status: CONSTANTS.CLASSROOM_STATUS.ACTIVE });
};

// Static method to find available classrooms (not full)
classroomSchema.statics.findAvailable = function(schoolId) {
    return this.find({
        school: schoolId,
        status: CONSTANTS.CLASSROOM_STATUS.ACTIVE,
        $expr: { $lt: ['$currentEnrollment', '$capacity'] }
    });
};

// Method to check if there's space for enrollment
classroomSchema.methods.hasSpace = function(count = 1) {
    return (this.currentEnrollment + count) <= this.capacity;
};

// Method to increment enrollment
classroomSchema.methods.incrementEnrollment = function(count = 1) {
    if (!this.hasSpace(count)) {
        throw new Error('Classroom is at full capacity');
    }
    this.currentEnrollment += count;
    return this.save();
};

// Method to decrement enrollment
classroomSchema.methods.decrementEnrollment = function(count = 1) {
    if (this.currentEnrollment - count < 0) {
        throw new Error('Cannot have negative enrollment');
    }
    this.currentEnrollment -= count;
    return this.save();
};

// Ensure virtuals are included in JSON
classroomSchema.set('toJSON', { virtuals: true });
classroomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Classroom', classroomSchema);
