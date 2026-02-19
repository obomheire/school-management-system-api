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
            path: 'assignedSchool',
            type: 'String',
            regex: /^[0-9a-fA-F]{24}$/,
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
