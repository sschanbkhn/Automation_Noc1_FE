import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const DepartmentGuard = ({ allowedDepartments = [], children }) => {
    const account = useSelector((state) => state.account);
    const { user } = account;

    const [hasAccess, setHasAccess] = useState(null); // Trạng thái kiểm tra quyền truy cập

    useEffect(() => {
        if (!user) {
            setHasAccess(false); // Không có user -> không có quyền truy cập
        } else if (!allowedDepartments.includes(user.department?.name)) {
            setHasAccess(false); // User không thuộc department cho phép -> không có quyền truy cập
        } else {
            setHasAccess(true); // Người dùng có quyền truy cập
        }
    }, [user, allowedDepartments]);

    if (hasAccess === null) {
        return <div>Loading...</div>; // Hiển thị khi đang kiểm tra quyền truy cập
    }

    if (hasAccess === false) {
        return <div>You do not have access to this page.</div>; // Thông báo không có quyền truy cập
    }

    return children; // Trả về các component con nếu người dùng có quyền truy cập
};

export default DepartmentGuard;
