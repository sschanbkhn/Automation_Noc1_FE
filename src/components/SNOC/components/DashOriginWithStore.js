import React from 'react';
import SnocStoreProvider from '../providers/SnocStoreProvider';
import SystemHealthDashboard from '../views/dashboard/DashOrigin/SystemHealthDashboard';

const DashOriginWithStore = () => {
  return (
    <SnocStoreProvider>
      <SystemHealthDashboard />
    </SnocStoreProvider>
  );
};

export default DashOriginWithStore;
