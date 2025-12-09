// R007Step6Results.tsx
// Step 6: Results & Download component

import React from "react";
import "./R007Step6Results.css";
import { JobResult } from "./R007generatorTypes";

interface Step6Props {
  result: JobResult | null;
  onNewJob: () => void;
  onViewDashboard: () => void;
}

const R007Step6Results: React.FC<Step6Props> = ({ result, onNewJob, onViewDashboard }) => {
  if (!result) {
    return (
      <div className="r007-step6-container">
        <div className="r007-no-result">
          <p>⚠️ No results available. Please complete the generation process.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (result.status) {
      case "success":
        return "#2e7d32";
      case "partial":
        return "#ed6c02";
      case "failed":
        return "#d32f2f";
      default:
        return "#666";
    }
  };

  const getStatusIcon = () => {
    switch (result.status) {
      case "success":
        return "✓";
      case "partial":
        return "⚠";
      case "failed":
        return "✗";
      default:
        return "?";
    }
  };

  const successRate = result.totalSites > 0 ? Math.round((result.successfulSites / result.totalSites) * 100) : 0;

  return (
    <div className="r007-step6-container">
      <div className="r007-step6-header">
        <h2>Step 6: Generation Complete!</h2>
        <p>Your configuration files have been generated successfully</p>
      </div>

      {/* Status Banner */}
      <div className={`r007-status-banner r007-status-${result.status}`} style={{ borderLeftColor: getStatusColor() }}>
        <div className="r007-status-icon" style={{ background: getStatusColor() }}>
          {getStatusIcon()}
        </div>
        <div className="r007-status-content">
          <h3>
            Job {result.jobNumber} - {result.status.toUpperCase()}
          </h3>
          <p>Completed in {result.duration}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="r007-results-stats">
        <div className="r007-stat-card">
          <div className="r007-stat-icon">📊</div>
          <div className="r007-stat-content">
            <div className="r007-stat-value">{result.totalSites}</div>
            <div className="r007-stat-label">Total Sites</div>
          </div>
        </div>
        <div className="r007-stat-card r007-stat-success">
          <div className="r007-stat-icon">✓</div>
          <div className="r007-stat-content">
            <div className="r007-stat-value">{result.successfulSites}</div>
            <div className="r007-stat-label">Successful</div>
          </div>
        </div>
        <div className="r007-stat-card r007-stat-failed">
          <div className="r007-stat-icon">✗</div>
          <div className="r007-stat-content">
            <div className="r007-stat-value">{result.failedSites}</div>
            <div className="r007-stat-label">Failed</div>
          </div>
        </div>
        <div className="r007-stat-card">
          <div className="r007-stat-icon">📈</div>
          <div className="r007-stat-content">
            <div className="r007-stat-value">{successRate}%</div>
            <div className="r007-stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Download Links */}
      <div className="r007-downloads-section">
        <h3>Download Files</h3>
        <div className="r007-download-cards">
          {result.downloadLinks.xmlZip && (
            <div className="r007-download-card">
              <div className="r007-download-icon">📦</div>
              <div className="r007-download-info">
                <div className="r007-download-title">XML Files (ZIP)</div>
                <div className="r007-download-desc">All generated configuration files</div>
              </div>
              <button className="r007-download-btn" onClick={() => window.open(result.downloadLinks.xmlZip, "_blank")}>
                Download
              </button>
            </div>
          )}

          {result.downloadLinks.errorReport && result.failedSites > 0 && (
            <div className="r007-download-card">
              <div className="r007-download-icon">📋</div>
              <div className="r007-download-info">
                <div className="r007-download-title">Error Report (Excel)</div>
                <div className="r007-download-desc">Detailed error information for failed sites</div>
              </div>
              <button className="r007-download-btn" onClick={() => window.open(result.downloadLinks.errorReport, "_blank")}>
                Download
              </button>
            </div>
          )}

          {result.downloadLinks.executionLog && (
            <div className="r007-download-card">
              <div className="r007-download-icon">📄</div>
              <div className="r007-download-info">
                <div className="r007-download-title">Execution Log (TXT)</div>
                <div className="r007-download-desc">Complete generation process log</div>
              </div>
              <button className="r007-download-btn" onClick={() => window.open(result.downloadLinks.executionLog, "_blank")}>
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next Actions */}
      <div className="r007-next-actions">
        <h3>What's Next?</h3>
        <div className="r007-action-cards">
          <div className="r007-action-card" onClick={onNewJob}>
            <div className="r007-action-icon">➕</div>
            <div className="r007-action-title">Create New Job</div>
            <div className="r007-action-desc">Start another generation process</div>
          </div>
          <div className="r007-action-card" onClick={onViewDashboard}>
            <div className="r007-action-icon">📊</div>
            <div className="r007-action-title">View Dashboard</div>
            <div className="r007-action-desc">Check overall statistics</div>
          </div>
          <div className="r007-action-card" onClick={() => alert("View job details")}>
            <div className="r007-action-icon">🔍</div>
            <div className="r007-action-title">Job Details</div>
            <div className="r007-action-desc">See complete job information</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default R007Step6Results;
