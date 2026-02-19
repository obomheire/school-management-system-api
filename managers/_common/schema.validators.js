const CONSTANTS = require('./constants');

module.exports = {
    'username': (data)=>{
        if(data.trim().length < 3){
            return false;
        }
        return true;
    },

    'role': (data)=>{
        const validRoles = Object.values(CONSTANTS.ROLES);
        return validRoles.includes(data);
    },

    'userStatus': (data)=>{
        const validStatuses = Object.values(CONSTANTS.USER_STATUS);
        return validStatuses.includes(data);
    },

    'schoolStatus': (data)=>{
        const validStatuses = Object.values(CONSTANTS.SCHOOL_STATUS);
        return validStatuses.includes(data);
    },

    'classroomStatus': (data)=>{
        const validStatuses = Object.values(CONSTANTS.CLASSROOM_STATUS);
        return validStatuses.includes(data);
    },

    'studentStatus': (data)=>{
        const validStatuses = Object.values(CONSTANTS.STUDENT_STATUS);
        return validStatuses.includes(data);
    },

    'phone': (data)=>{
        // Basic phone validation (10-15 digits, optionally with +, -, spaces, parentheses)
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
        return phoneRegex.test(data);
    },

    'capacity': (data)=>{
        const num = parseInt(data);
        return num >= CONSTANTS.CLASSROOM.MIN_CAPACITY && num <= CONSTANTS.CLASSROOM.MAX_CAPACITY;
    },

    'password': (data)=>{
        if (typeof data !== 'string') return false;
        return data.length >= CONSTANTS.PASSWORD.MIN_LENGTH;
    },

    'studentId': (data)=>{
        // Student ID must be alphanumeric and at least 3 characters
        if (typeof data !== 'string') return false;
        return data.trim().length >= 3 && /^[a-zA-Z0-9\-_]+$/.test(data);
    },

    'date': (data)=>{
        if (data === null || data === undefined) return false;
        const parsed = new Date(data);
        return !Number.isNaN(parsed.getTime());
    }
}
