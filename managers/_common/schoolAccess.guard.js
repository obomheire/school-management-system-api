const rbacHelper = require('./rbac.helper');

const resolveRequestedSchoolId = ({ __params, __query, schoolId, scopedSchoolId }) => {
    return (
        schoolId ||
        (__params && (__params.schoolId || __params.id)) ||
        (__query && (__query.schoolId || __query.id)) ||
        scopedSchoolId ||
        null
    );
};

const resolveManagedSchoolId = ({
    __role,
    __params,
    __query,
    schoolId,
    scopedSchoolId,
    allowSuperadmin = true,
    allowSchoolAdmin = true,
}) => {
    if (!__role || !__role.role) {
        return { error: 'Authentication required' };
    }

    const requestedSchoolId = resolveRequestedSchoolId({
        __params,
        __query,
        schoolId,
        scopedSchoolId,
    });

    if (rbacHelper.isSuperadmin(__role.role)) {
        if (!allowSuperadmin) {
            return { error: 'Access denied' };
        }
        if (!requestedSchoolId) {
            return { error: 'School ID is required' };
        }
        return { schoolId: requestedSchoolId };
    }

    if (rbacHelper.isSchoolAdmin(__role.role)) {
        if (!allowSchoolAdmin) {
            return { error: 'Access denied' };
        }
        if (!__role.assignedSchool) {
            return { error: 'No school assigned to this administrator' };
        }
        if (requestedSchoolId && requestedSchoolId !== __role.assignedSchool) {
            return { error: 'Access denied. You can only manage your assigned school.' };
        }
        return { schoolId: __role.assignedSchool };
    }

    return { error: 'Access denied' };
};

module.exports = {
    resolveManagedSchoolId,
};
