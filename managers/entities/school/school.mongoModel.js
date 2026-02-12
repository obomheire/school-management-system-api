const mongoose = require('mongoose');
const CONSTANTS = require('../../_common/constants');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'School name is required'],
        trim: true,
        minlength: [3, 'School name must be at least 3 characters long'],
        maxlength: [200, 'School name cannot exceed 200 characters']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
            trim: true
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
            default: 'USA'
        }
    },
    contactInfo: {
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        website: {
            type: String,
            trim: true
        }
    },
    status: {
        type: String,
        enum: Object.values(CONSTANTS.SCHOOL_STATUS),
        default: CONSTANTS.SCHOOL_STATUS.ACTIVE
    },
    administrators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    metadata: {
        establishedDate: {
            type: Date
        },
        registrationNumber: {
            type: String,
            trim: true
        },
        accreditation: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
schoolSchema.index({ name: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ 'contactInfo.email': 1 });
schoolSchema.index({ 'address.city': 1 });
schoolSchema.index({ 'address.state': 1 });
schoolSchema.index({ createdAt: -1 });

// Virtual for full address
schoolSchema.virtual('fullAddress').get(function() {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Static method to find active schools
schoolSchema.statics.findActive = function(filter = {}) {
    return this.find({ ...filter, status: CONSTANTS.SCHOOL_STATUS.ACTIVE });
};

// Static method to find school by name
schoolSchema.statics.findByName = function(name) {
    return this.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
};

// Method to add administrator
schoolSchema.methods.addAdministrator = function(adminId) {
    if (!this.administrators.includes(adminId)) {
        this.administrators.push(adminId);
    }
    return this.save();
};

// Method to remove administrator
schoolSchema.methods.removeAdministrator = function(adminId) {
    this.administrators = this.administrators.filter(
        id => id.toString() !== adminId.toString()
    );
    return this.save();
};

// Ensure virtuals are included in JSON
schoolSchema.set('toJSON', { virtuals: true });
schoolSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('School', schoolSchema);
