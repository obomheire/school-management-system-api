module.exports = {
    createSchool: [
        {
            model: 'text',
            path: 'name',
            required: true
        },
        {
            path: 'address',
            type: 'Object',
            required: true
        },
        {
            path: 'contactInfo',
            type: 'Object',
            required: true
        },
        {
            path: 'metadata',
            type: 'Object',
            required: false
        }
    ],

    updateSchool: [
        {
            model: 'text',
            path: 'name',
            required: false
        },
        {
            path: 'address',
            type: 'Object',
            required: false
        },
        {
            path: 'contactInfo',
            type: 'Object',
            required: false
        },
        {
            path: 'status',
            type: 'String',
            custom: 'schoolStatus',
            required: false
        },
        {
            path: 'metadata',
            type: 'Object',
            required: false
        }
    ],

    assignAdministrator: [
        {
            path: 'adminId',
            type: 'String',
            regex: /^[0-9a-fA-F]{24}$/,
            required: true
        }
    ]
};
