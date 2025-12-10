// R007Generator.tsx
// Main Generator component - manages 6-step workflow

import React, { useState } from "react";
import "./R007Generator.css";
import { GeneratorState, CommissionType, SiteData } from "./R007generatorTypes";
import { mockSitesData } from "./R007generatorMockData";

const R007Generator: React.FC = () => {
  // State management
  const [state, setState] = useState<GeneratorState>({
    currentStep: 1,
    commissionType: null,
    uploadedFile: null,
    sites: [],
    siteGroups: [],
    generationProgress: null,
    jobResult: null,
    error: null,
  });

  // Navigation handlers
  const goToStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    if (state.currentStep < 6) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  // Step 1: Select Commission Type
  const handleCommissionTypeSelect = (type: CommissionType) => {
    setState((prev) => ({ ...prev, commissionType: type }));
  };

  // Step 2: Upload file
  const handleFileUpload = async (file: File) => {
    setState((prev) => ({ ...prev, uploadedFile: file }));
    // Mock: Load sites data
    setTimeout(() => {
      setState((prev) => ({ ...prev, sites: mockSitesData }));
    }, 500);
  };

  // Step 3: Update site selection
  const handleSiteSelectionChange = (siteId: string, selected: boolean) => {
    setState((prev) => ({
      ...prev,
      sites: prev.sites.map((site) => (site.id === siteId ? { ...site, selected } : site)),
    }));
  };

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <div className="r007-step-content">
            <h2>Step 1: Select Commission Type</h2>

            {/* Label hiển thị selection - Góc phải */}
            {state.commissionType && (
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  padding: "8px 16px",
                  background: state.commissionType === "SiteConfig" ? "#fff3e0" : "#e3f2fd",
                  color: state.commissionType === "SiteConfig" ? "#e65100" : "#1976d2",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                ✓ {state.commissionType === "SiteConfig" ? "Site Configuration" : "Auto PnP"} Selected
              </div>
            )}

            {/* Cards */}
            <div className="r007-commission-types">
              {/* Card 1: Site Config */}
              <div
                className={`r007-type-card ${state.commissionType === "SiteConfig" ? "selected" : ""}`}
                onClick={() => handleCommissionTypeSelect("SiteConfig")}
                onMouseEnter={(e) => {
                  if (state.commissionType !== "SiteConfig") {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "#e3f2fd";
                  }
                }}
                onMouseLeave={(e) => {
                  if (state.commissionType !== "SiteConfig") {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#f9f9f9";
                  }
                }}
              >
                <div className="r007-type-icon">🔧</div>
                <h3>Site Configuration</h3>
                <p>Manual commissioning at site</p>
                <ul>
                  <li>Engineer goes to site</li>
                  <li>Full parameter control</li>
                  <li>Complex configuration</li>
                </ul>
              </div>

              {/* Card 2: Auto PnP */}
              <div
                className={`r007-type-card ${state.commissionType === "AutoPnP" ? "selected" : ""}`}
                onClick={() => handleCommissionTypeSelect("AutoPnP")}
                onMouseEnter={(e) => {
                  if (state.commissionType !== "AutoPnP") {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "#e3f2fd";
                  }
                }}
                onMouseLeave={(e) => {
                  if (state.commissionType !== "AutoPnP") {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#f9f9f9";
                  }
                }}
              >
                <div className="r007-type-icon">🤖</div>
                <h3>Auto PnP</h3>
                <p>Automated remote deployment</p>
                <ul>
                  <li>Remote execution</li>
                  <li>Batch processing</li>
                  <li>Fast rollout</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="r007-step-content">
            <h2>Step 2: Upload Datafill Excel</h2>
            <p className="r007-step-desc">
              💡 Need template?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Download template");
                }}
              >
                Download
              </a>
            </p>
            <div className="r007-upload-area">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="file-upload" className="r007-upload-label">
                <div className="r007-upload-icon">📄</div>
                <p>Drag and drop your Excel file here</p>
                <p>or</p>
                <button className="r007-browse-btn">Browse Files</button>
                <p className="r007-upload-hint">Supported: .xlsx, .xls (Max: 2GB)</p>
              </label>
            </div>
            {state.uploadedFile && (
              <div className="r007-file-info">
                <p>✓ Uploaded: {state.uploadedFile.name}</p>
                <p>Sites detected: {state.sites.length}</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="r007-step-content">
            <h2>Step 3: Preview & Select Sites</h2>
            <p>Review and edit site data. Deselect sites you don't want to process.</p>
            <div className="r007-preview-info">
              <p>Total sites: {state.sites.length}</p>
              <p>Selected: {state.sites.filter((s) => s.selected).length}</p>
              <p>Invalid: {state.sites.filter((s) => s.validationStatus === "invalid").length}</p>
            </div>
            <div className="r007-table-wrapper">
              <table className="r007-preview-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
                    </th>
                    <th>STT</th>
                    <th>Site Name</th>
                    <th>IP OAM</th>
                    <th>VLAN</th>
                    <th>Band</th>
                    <th>RRH</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.sites.map((site) => (
                    <tr key={site.id}>
                      <td>
                        <input type="checkbox" checked={site.selected} onChange={(e) => handleSiteSelectionChange(site.id, e.target.checked)} />
                      </td>
                      <td>{site.stt}</td>
                      <td>{site.siteName}</td>
                      <td>{site.ipOam}</td>
                      <td>{site.vlanMsPlane}</td>
                      <td>{site.band5g}</td>
                      <td>{site.rrh5g}</td>
                      <td>
                        <span className={`r007-status-badge r007-status-${site.validationStatus}`}>{site.validationStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="r007-step-content">
            <h2>Step 4: Template Matching</h2>
            <p>Templates will be matched based on RRH Type, Band, and Technology</p>
            <p className="r007-placeholder">🚧 Template matching UI - Coming in next files</p>
          </div>
        );

      case 5:
        return (
          <div className="r007-step-content">
            <h2>Step 5: Generate XML Files</h2>
            <p>Generate configuration files for selected sites</p>
            <p className="r007-placeholder">🚧 Generation progress UI - Coming in next files</p>
          </div>
        );

      case 6:
        return (
          <div className="r007-step-content">
            <h2>Step 6: Results & Download</h2>
            <p>Generation completed! Download your files.</p>
            <p className="r007-placeholder">🚧 Results & download UI - Coming in next files</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="r007-generator">
      {/* Header */}
      {/*
      <div className="r007-generator-header">
        <h1>Generator</h1>
        <p>Generate XML configuration files for 5G site commissioning</p>
          </div>
          
          */}

      {/* Step Indicator */}
      <div className="r007-steps-indicator">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className={`r007-step-item ${state.currentStep === step ? "active" : ""} ${state.currentStep > step ? "completed" : ""}`}>
            <div className="r007-step-number">{step}</div>
            <div className="r007-step-label">
              {step === 1 && "Select Type"}
              {step === 2 && "Upload"}
              {step === 3 && "Preview"}
              {step === 4 && "Templates"}
              {step === 5 && "Generate"}
              {step === 6 && "Results"}
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="r007-generator-content">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="r007-generator-nav">
        {state.currentStep > 1 && (
          <button className="r007-nav-btn r007-btn-secondary" onClick={prevStep}>
            ← Back
          </button>
        )}
        {state.currentStep < 6 && (
          <button className="r007-nav-btn r007-btn-primary" onClick={nextStep} disabled={(state.currentStep === 1 && !state.commissionType) || (state.currentStep === 2 && !state.uploadedFile)}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};

export default R007Generator;
