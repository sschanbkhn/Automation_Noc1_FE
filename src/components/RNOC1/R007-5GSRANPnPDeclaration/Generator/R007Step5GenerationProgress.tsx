// R007Step5GenerationProgress.tsx
// Step 5: Generation Progress component

import React from "react";
import "./R007Step5GenerationProgress.css";
import { GenerationProgress } from "./R007generatorTypes";

interface Step5Props {
  progress: GenerationProgress | null;
  isGenerating: boolean;
  onStartGeneration: () => void;
}

const R007Step5GenerationProgress: React.FC<Step5Props> = ({ progress, isGenerating, onStartGeneration }) => {
  const getStepStatus = (stepNumber: number) => {
    if (!progress) return "pending";
    if (progress.currentStep > stepNumber) return "completed";
    if (progress.currentStep === stepNumber) return "active";
    return "pending";
  };

  const generationSteps = [
    { number: 1, title: "Validating Data", description: "Checking site data integrity" },
    { number: 2, title: "Loading Templates", description: "Reading XML templates" },
    { number: 3, title: "Generating XMLs", description: "Creating configuration files" },
    { number: 4, title: "Finalizing", description: "Packaging files for download" },
  ];

  return (
    <div className="r007-step5-container">
      <div className="r007-step5-header">
        <h2>Step 5: Generate XML Files</h2>
        <p>Generate configuration files for selected sites and templates</p>
      </div>

      {!isGenerating && !progress && (
        <div className="r007-pre-generation">
          <div className="r007-generation-summary">
            <h3>Ready to Generate</h3>
            <div className="r007-summary-items">
              <div className="r007-summary-item">
                <span className="r007-summary-icon">📋</span>
                <div className="r007-summary-content">
                  <div className="r007-summary-label">Sites Selected</div>
                  <div className="r007-summary-number">0</div>
                </div>
              </div>
              <div className="r007-summary-item">
                <span className="r007-summary-icon">📄</span>
                <div className="r007-summary-content">
                  <div className="r007-summary-label">Templates Matched</div>
                  <div className="r007-summary-number">0</div>
                </div>
              </div>
              <div className="r007-summary-item">
                <span className="r007-summary-icon">⏱️</span>
                <div className="r007-summary-content">
                  <div className="r007-summary-label">Estimated Time</div>
                  <div className="r007-summary-number">~2 mins</div>
                </div>
              </div>
            </div>
          </div>

          <button className="r007-start-generation-btn" onClick={onStartGeneration}>
            🚀 Start Generation
          </button>
        </div>
      )}

      {(isGenerating || progress) && (
        <div className="r007-generation-active">
          {/* Overall Progress */}
          <div className="r007-overall-progress">
            <div className="r007-progress-header">
              <span className="r007-progress-label">Overall Progress</span>
              <span className="r007-progress-percentage">{progress?.percentage || 0}%</span>
            </div>
            <div className="r007-progress-bar-container">
              <div className="r007-progress-bar-fill" style={{ width: `${progress?.percentage || 0}%` }}></div>
            </div>
            <div className="r007-progress-stats">
              <span>
                Completed: {progress?.completedSites || 0} / {progress?.totalSites || 0}
              </span>
              <span>Failed: {progress?.failedSites || 0}</span>
            </div>
          </div>

          {/* Generation Steps */}
          <div className="r007-generation-steps">
            {generationSteps.map((step) => (
              <div key={step.number} className={`r007-gen-step r007-gen-step-${getStepStatus(step.number)}`}>
                <div className="r007-gen-step-number">{getStepStatus(step.number) === "completed" ? "✓" : step.number}</div>
                <div className="r007-gen-step-content">
                  <div className="r007-gen-step-title">{step.title}</div>
                  <div className="r007-gen-step-desc">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Activity */}
          {progress && (
            <div className="r007-current-activity">
              <div className="r007-activity-icon">⚙️</div>
              <div className="r007-activity-content">
                <div className="r007-activity-label">Current Task:</div>
                <div className="r007-activity-message">{progress.message}</div>
                {progress.currentSite && <div className="r007-activity-site">Processing: {progress.currentSite}</div>}
              </div>
            </div>
          )}

          {/* Spinning loader */}
          {isGenerating && (
            <div className="r007-loader-container">
              <div className="r007-loader"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default R007Step5GenerationProgress;
