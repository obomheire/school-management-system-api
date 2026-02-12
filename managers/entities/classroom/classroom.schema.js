module.exports = {
    createClassroom: [
        {
            model: 'text',
            path: 'name',
            required: true
        },
        {
            model: 'text',
            path: 'roomNumber',
            required: true
        },
        {
            model: 'text',
            path: 'gradeLevel',
            required: true
        },
        {
            model: 'number',
            path: 'capacity',
            custom: 'capacity',
            required: true
        },
        {
            path: 'resources',
            type: 'Array',
            required: false
        }
    ],

    updateClassroom: [
        {
            model: 'text',
            path: 'name',
            required: false
        },
        {
            model: 'number',
            path: 'capacity',
            custom: 'capacity',
            required: false
        },
        {
            path: 'resources',
            type: 'Array',
            required: false
        },
        {
            path: 'status',
            type: 'String',
            custom: 'classroomStatus',
            required: false
        }
    ]
};
