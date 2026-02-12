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
            model: 'id',
            path: 'adminId',
            required: true
        }
    ]
};
