import React from 'react';
import Dashboard from './Dashboard';

interface UC2IndexProps {
  goToTab?: (tabKey: string) => void;
  filters?: {
    vendor?: string;
    department?: string;
  };
  setFilters?: (filters: { vendor?: string; department?: string }) => void;
}

const IndexPage: React.FC<UC2IndexProps> = ({ goToTab, filters, setFilters }) => {
  return (
    <div className="p-3">
      <Dashboard goToTab={goToTab} filters={filters} setFilters={setFilters} />
    </div>
  );
};

export default IndexPage;
