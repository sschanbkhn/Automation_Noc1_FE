import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import React from 'react';


const RoleGuard = ({ allowedRoles = [], children }) => {
    const account = useSelector((state) => state.account);
    const { user } = account;

    if (!user || !allowedRoles.includes(user.role)) {
        // Optionally: show nothing, show a "403", or redirect
        return null; // or <Redirect to="/not-authorized" />
    }

    return children;
};

export default RoleGuard;
