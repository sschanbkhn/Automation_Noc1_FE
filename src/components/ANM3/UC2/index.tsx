import React from 'react';
import Dashboard from './Dashboard';

interface UC2IndexProps {
  goToTab?: (tabKey: string) => void;
  filters?: {
    status?: string
  }
}

const IndexPage: React.FC<UC2IndexProps> = ({ goToTab, filters }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab} filters={filters} />
    </div>
  );
};

export default IndexPage;
