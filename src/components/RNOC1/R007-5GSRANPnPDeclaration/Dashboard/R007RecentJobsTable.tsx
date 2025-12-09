// R007RecentJobsTable.tsx
// Recent jobs table component

import React, { useState } from "react";
import "./R007RecentJobsTable.css";
import { Job } from "./R007types";

interface RecentJobsTableProps {
  jobs: Job[];
}

const R007RecentJobsTable: React.FC<RecentJobsTableProps> = ({ jobs }) => {
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const typeMatch = filterType === "All" || job.type === filterType;
    const statusMatch = filterStatus === "All" || job.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Completed":
        return "#2e7d32";
      case "Processing":
        return "#0288d1";
      case "Failed":
        return "#d32f2f";
      case "Partial":
        return "#ed6c02";
      default:
        return "#666";
    }
  };

  return (
    <div className="r007-table-container">
      <div className="r007-table-header">
        <h2 className="r007-table-title">Recent Jobs</h2>

        <div className="r007-filters">
          <select
            className="r007-filter-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Types</option>
            <option value="SiteConfig">Site Config</option>
            <option value="AutoPnP">Auto PnP</option>
          </select>

          <select
            className="r007-filter-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="r007-table-wrapper">
        <table className="r007-table">
          <thead>
            <tr>
              <th>Job #</th>
              <th>Type</th>
              <th>Status</th>
              <th>Total Sites</th>
              <th>Success</th>
              <th>Failed</th>
              <th>Created</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="r007-no-data">
                  No jobs found
                </td>
              </tr>
            ) : (
              currentJobs.map((job) => (
                <tr key={job.id}>
                  <td className="r007-job-number">{job.jobNumber}</td>
                  <td>
                    <span className={`r007-type-badge r007-type-${job.type.toLowerCase()}`}>{job.type === "SiteConfig" ? "🔧 Site Config" : "🤖 Auto PnP"}</span>
                  </td>
                  <td>
                    <span className="r007-status-badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                      {job.status}
                    </span>
                  </td>
                  <td className="r007-number">{job.totalSites}</td>
                  <td className="r007-number r007-success">{job.successfulSites}</td>
                  <td className="r007-number r007-failed">{job.failedSites}</td>
                  <td className="r007-date">{job.createdAt}</td>
                  <td>{job.duration || "-"}</td>
                  <td>
                    <button className="r007-action-btn" onClick={() => alert(`View details for ${job.jobNumber}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="r007-pagination">
          <button className="r007-page-btn" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            ← Previous
          </button>

          <span className="r007-page-info">
            Page {currentPage} of {totalPages} ({filteredJobs.length} jobs)
          </span>

          <button className="r007-page-btn" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default R007RecentJobsTable;
