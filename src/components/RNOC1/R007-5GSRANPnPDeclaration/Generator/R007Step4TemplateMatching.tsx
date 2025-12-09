// R007Step4TemplateMatching.tsx
// Step 4: Template Matching component

import React from "react";
import "./R007Step4TemplateMatching.css";
import { SiteGroup, TemplateInfo } from "./R007generatorTypes";

interface Step4Props {
  siteGroups: SiteGroup[];
  onTemplateSelect: (groupId: string, template: TemplateInfo) => void;
}

const R007Step4TemplateMatching: React.FC<Step4Props> = ({ siteGroups, onTemplateSelect }) => {
  return (
    <div className="r007-step4-container">
      <div className="r007-step4-header">
        <h2>Step 4: Template Matching</h2>
        <p>Sites have been grouped by RRH Type, Band, and Technology. Select a template for each group.</p>
      </div>

      <div className="r007-step4-summary">
        <div className="r007-summary-card">
          <span className="r007-summary-label">Total Groups:</span>
          <span className="r007-summary-value">{siteGroups.length}</span>
        </div>
        <div className="r007-summary-card">
          <span className="r007-summary-label">Total Sites:</span>
          <span className="r007-summary-value">{siteGroups.reduce((sum, group) => sum + group.siteCount, 0)}</span>
        </div>
        <div className="r007-summary-card">
          <span className="r007-summary-label">Templates Needed:</span>
          <span className="r007-summary-value">{siteGroups.length}</span>
        </div>
      </div>

      <div className="r007-groups-container">
        {siteGroups.map((group) => (
          <div key={group.id} className="r007-group-card">
            <div className="r007-group-header">
              <h3>{group.name}</h3>
              <span className="r007-group-count">{group.siteCount} sites</span>
            </div>

            <div className="r007-group-criteria">
              <div className="r007-criteria-item">
                <span className="r007-criteria-label">RRH Type:</span>
                <span className="r007-criteria-value">{group.criteria.rrhType}</span>
              </div>
              <div className="r007-criteria-item">
                <span className="r007-criteria-label">Band:</span>
                <span className="r007-criteria-value">{group.criteria.band}</span>
              </div>
              <div className="r007-criteria-item">
                <span className="r007-criteria-label">Technology:</span>
                <span className="r007-criteria-value">{group.criteria.technology}</span>
              </div>
            </div>

            <div className="r007-template-selection">
              <label className="r007-template-label">Select Template:</label>
              <select
                className="r007-template-select"
                value={group.selectedTemplate?.id || ""}
                onChange={(e) => {
                  const template = group.suggestedTemplates.find((t) => t.id === e.target.value);
                  if (template) {
                    onTemplateSelect(group.id, template);
                  }
                }}
              >
                <option value="">-- Select Template --</option>
                {group.suggestedTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.version}) - Used {template.usageCount} times
                  </option>
                ))}
              </select>

              {group.selectedTemplate && (
                <div className="r007-template-info">
                  <div className="r007-template-detail">
                    <span className="r007-detail-icon">📄</span>
                    <div className="r007-detail-content">
                      <div className="r007-detail-name">{group.selectedTemplate.name}</div>
                      <div className="r007-detail-meta">
                        Version: {group.selectedTemplate.version} | Last updated: {group.selectedTemplate.lastUpdated}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="r007-group-sites">
              <button className="r007-view-sites-btn" onClick={() => alert(`Sites in this group: ${group.siteIds.join(", ")}`)}>
                View Sites ({group.siteCount})
              </button>
            </div>
          </div>
        ))}
      </div>

      {siteGroups.length === 0 && (
        <div className="r007-no-groups">
          <p>⚠️ No site groups available. Please go back and select sites.</p>
        </div>
      )}
    </div>
  );
};

export default R007Step4TemplateMatching;
