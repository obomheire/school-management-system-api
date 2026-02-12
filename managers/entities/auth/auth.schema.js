module.exports = {
    register: [
        {
            model: 'username',
            required: true
        },
        {
            model: 'email',
            required: true
        },
        {
            model: 'password',
            path: 'password',
            type: 'String',
            custom: 'password',
            required: true
        },
        {
            path: 'role',
            type: 'String',
            custom: 'role',
            required: true
        },
        {
            model: 'id',
            path: 'assignedSchool',
            required: false
        }
    ],

    login: [
        {
            model: 'email',
            required: true
        },
        {
            model: 'password',
            path: 'password',
            type: 'String',
            required: true
        }
    ]
};
