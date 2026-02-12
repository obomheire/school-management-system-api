module.exports = {
    enrollStudent: [
        {
            model: 'text',
            path: 'firstName',
            required: true
        },
        {
            model: 'text',
            path: 'lastName',
            required: true
        },
        {
            path: 'dateOfBirth',
            type: 'Date',
            required: true
        },
        {
            path: 'studentId',
            type: 'String',
            custom: 'studentId',
            required: true
        },
        {
            model: 'id',
            path: 'classroomId',
            required: true
        },
        {
            path: 'guardianInfo',
            type: 'Object',
            required: true
        }
    ],

    updateStudent: [
        {
            model: 'text',
            path: 'firstName',
            required: false
        },
        {
            model: 'text',
            path: 'lastName',
            required: false
        },
        {
            path: 'guardianInfo',
            type: 'Object',
            required: false
        },
        {
            path: 'status',
            type: 'String',
            custom: 'studentStatus',
            required: false
        }
    ],

    transferStudent: [
        {
            model: 'id',
            path: 'targetSchoolId',
            required: true
        },
        {
            model: 'id',
            path: 'targetClassroomId',
            required: true
        },
        {
            model: 'longText',
            path: 'reason',
            required: false
        }
    ]
};
