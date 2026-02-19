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
            type: 'String',
            custom: 'date',
            required: true
        },
        {
            path: 'studentId',
            type: 'String',
            custom: 'studentId',
            required: true
        },
        {
            path: 'classroomId',
            type: 'String',
            regex: /^[0-9a-fA-F]{24}$/,
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
            path: 'targetSchoolId',
            type: 'String',
            regex: /^[0-9a-fA-F]{24}$/,
            required: true
        },
        {
            path: 'targetClassroomId',
            type: 'String',
            regex: /^[0-9a-fA-F]{24}$/,
            required: true
        },
        {
            model: 'longText',
            path: 'reason',
            required: false
        }
    ]
};
