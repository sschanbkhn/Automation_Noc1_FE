// Example: Cách thêm route cho DashboardAudit trong React Router

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardAudit from '../components/RNOC1/R001/DashboardAudit';

// Trong component Routes chính của ứng dụng
const AppRoutes = () => {
  return (
    <Routes>
      {/* Các routes khác */}
      
      {/* Route cho Dashboard Audit R001 */}
      <Route 
        path="/rnoc/r001/dashboard-audit" 
        element={<DashboardAudit />} 
      />
      
      {/* Hoặc nested routes */}
      <Route path="/rnoc/*">
        <Route path="r001/dashboard-audit" element={<DashboardAudit />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

// Hoặc thêm vào menu navigation
const menuItems = [
  // ... other items
  {
    key: 'r001-dashboard',
    label: 'Dashboard Audit R001',
    path: '/rnoc/r001/dashboard-audit',
    icon: <DashboardOutlined />
  }
];