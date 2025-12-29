
// R007GeneratorStep6.tsx
// import React from "react";
import React, { useState, useEffect } from "react";
import { GeneratorState } from "./R007generatorTypes";
import { R007GeneratorService, ExecutionResultsResponse } from "./R007GeneratorService";
// import { R007GeneratorService, ExecutionResultsResponse } from "./R007GeneratorService";






import API_CONFIG from "../Designer/ApiR0075GSRANPnPDeclarationConfig";


interface Step6Props {
  state: GeneratorState;
  setState: React.Dispatch<React.SetStateAction<GeneratorState>>;
  goToStep: (step: number) => void;
}



const R007GeneratorPnPStep6: React.FC<Step6Props> = ({
  state,
  setState,
  goToStep,
}) => {


  const [results, setResults] = useState<ExecutionResultsResponse | null>(null);
const [isLoading, setIsLoading] = useState(true);


// Thêm sau dòng const [isLoading, setIsLoading] = useState(true);

const [activeCard, setActiveCard] = useState<"total" | "successful" | "failed" | null>(null);
const [showModal, setShowModal] = useState(false);
  
  // Download handlers
  const handleDownloadXML = () => {
    // TODO: Call API - GET /api/generator/download/{jobId}
    console.log("📥 Downloading XML files...");
    if (!state.currentJobId) {
    alert("No job ID found");
    return;
  }


  const downloadUrl = `${API_CONFIG.BASE_URL}/generator/download/${state.currentJobId}`;
  window.open(downloadUrl, '_blank');
  console.log("📥 Downloading XML ZIP from:", downloadUrl);

  };

  // ====================================================================

  const handleDownloadErrorReport = () => {
    // TODO: Call API - GET /api/oss/error-report/{executionId}
    if (!state.currentExecutionId) {
    alert("No execution ID found");
    return;
  }
  
  const downloadUrl = `${API_CONFIG.BASE_URL}/generator/error-report/${state.currentExecutionId}`;
  window.open(downloadUrl, '_blank');

    console.log("📥 Downloading error report...");
  };
// ====================================================================
  const handleDownloadLogs = () => {
    // TODO: Call API - GET /api/oss/logs/{executionId}

    if (!state.currentExecutionId) {
    alert("No execution ID found");
    return;
  }
  
  const downloadUrl = `${API_CONFIG.BASE_URL}/generator/logs/${state.currentExecutionId}`;
  window.open(downloadUrl, '_blank');


    console.log("📥 Downloading execution logs...");
  };
{/* // ==================================================================== */}


// ====================================================================
// Helper: Format Duration
// ====================================================================
const formatDuration = (startTime: Date | null, endTime: Date | null): string => {
  if (!startTime) return "Not started";
  if (!endTime) return "In progress...";
  
  const durationMs = endTime.getTime() - startTime.getTime();
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// ====================================================================
// Calculate Total Duration
// ====================================================================

const calculateTotalDuration = (): string => {
  const genStart = state.executionTimestamps.generateXML.startTime;
  const execEnd = state.executionTimestamps.executeCommissioning.endTime;
  
  if (!genStart || !execEnd) {
    return "N/A";
  }
  
  return formatDuration(genStart, execEnd);
};
  // ====================================================================


// Load results khi vào Step 6
useEffect(() => {
  const loadResults = async () => {
    // ✅ Đọc từ state.currentExecutionId
    const executionId = state.currentExecutionId;
    
    
    

    // ✅ Check currentExecutionId
    if (!executionId) {
      console.error("❌ No executionId found");
      setIsLoading(false);
      return;
    }

    try {
      console.log("📊 Loading job results...");
      // ✅ Dùng biến executionId local
      const jobResults = await R007GeneratorService.getJobResults(executionId);
      
      setResults(jobResults);
      
      // Update state với results

      // ✅ MỚI - Đầy đủ fields:
setState(prev => ({
  ...prev,
  jobResult: {
    // jobId: "", // TODO: Get from generation step
    jobId: state.currentJobId || "", // ← Lấy từ state
    jobNumber: "",  // ← String, không phải number



    status: jobResults.status as "success" | "partial" | "failed",
    totalSites: jobResults.totalSites,
    successfulSites: jobResults.successfulSites,
    failedSites: jobResults.failedSites,
    duration: jobResults.duration,
    downloadLinks: jobResults.downloadLinks,
  }
}));
      
      console.log("✅ Results loaded:", jobResults);
    } catch (error) {
      console.error("❌ Error loading results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadResults();

  
  

  }, []); // ← Chạy 1 lần khi mount
{/* // ==================================================================== */}

  return (
    <div className="r007-step-content" style={{ height: "500px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 40px",
          background: "white",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginTop: "-40px",
          marginBottom: "24px",
          marginLeft: "-40px",
          marginRight: "-40px",
          width: "calc(100% + 80px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #059669, #047857)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(5, 150, 105, 0.3)",
              fontSize: "28px",
              marginLeft: "-20px",
            }}
          >
            ✅
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                color: "#1a202c",
                lineHeight: "1.2",
              }}
            >
              Step 6: Results & Download
            </h1>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              View commissioning results and download files
            </p>
          </div>
        </div>
{/* // ==================================================================== */}
        {/* Right: Commission Type Badge */}
        {state.commissionType && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              border: "2px solid #e0e0e0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              gap: "10px",
              padding: "12px 20px",
              borderRadius: "12px",
              marginRight: "-20px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: state.commissionType === "SiteConfig" 
                  ? "linear-gradient(135deg, #f97316, #ea580c)" 
                  : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: state.commissionType === "SiteConfig" 
                  ? "0 4px 12px rgba(249, 115, 22, 0.3)" 
                  : "0 4px 12px rgba(139, 92, 246, 0.3)",
                fontSize: "20px",
              }}
            >
              {state.commissionType === "SiteConfig" ? "🛠️" : "⚡"}
            </div>
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#999",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "3px",
                }}
              >
                Commission Type
              </div>
              <div
                style={{
                  fontWeight: "700",
                  color: "#333",
                  fontSize: "15px",
                }}
              >
                {state.commissionType === "SiteConfig" ? "Site Configuration" : "Auto PnP"}
              </div>
            </div>
          </div>
        )}
      </div>
{/* // ==================================================================== */}
      {/* CONTENT */}
      <div
        style={{
          marginLeft: "-40px",
          marginRight: "-40px",
          paddingLeft: "40px",
          paddingRight: "40px",
        }}
      >
        {/* Summary Cards */}
        

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  }}
>

{/* // ==================================================================== */}
        {/* Total Sites - CLICKABLE */}
<div
  onClick={() => {
    setActiveCard("total");
    setShowModal(true);
  }}
  style={{
    background: activeCard === "total" 
      ? "linear-gradient(135deg, #e3f2fd, #bbdefb)" 
      : "white",
    padding: "20px",
    borderRadius: "12px",
    border: activeCard === "total" 
      ? "2px solid #1976d2" 
      : "2px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    transform: activeCard === "total" ? "scale(1.05)" : "scale(1)",
    boxShadow: activeCard === "total" 
      ? "0 8px 24px rgba(25, 118, 210, 0.3)" 
      : "none",
  }}
  onMouseEnter={(e) => {
    if (activeCard !== "total") {
      e.currentTarget.style.borderColor = "#1976d2";
      e.currentTarget.style.transform = "scale(1.02)";
    }
  }}
  onMouseLeave={(e) => {
    if (activeCard !== "total") {
      e.currentTarget.style.borderColor = "#e0e0e0";
      e.currentTarget.style.transform = "scale(1)";
    }
  }}
>
  <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px", fontWeight: "600" }}>
    📊 Total Sites {activeCard === "total" && "⬇️"}
  </div>
  <div style={{ fontSize: "28px", fontWeight: "700", color: "#1976d2" }}>
    {state.jobResult?.totalSites || 0}
  </div>
</div>

{/* Successful - CLICKABLE */}
<div
  onClick={() => {
    setActiveCard("successful");
    setShowModal(true);
  }}
  style={{
    background: activeCard === "successful" 
      ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
      : "white",
    padding: "20px",
    borderRadius: "12px",
    border: activeCard === "successful" 
      ? "2px solid #059669" 
      : "2px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    transform: activeCard === "successful" ? "scale(1.05)" : "scale(1)",
    boxShadow: activeCard === "successful" 
      ? "0 8px 24px rgba(5, 150, 105, 0.3)" 
      : "none",
  }}
  onMouseEnter={(e) => {
    if (activeCard !== "successful") {
      e.currentTarget.style.borderColor = "#059669";
      e.currentTarget.style.transform = "scale(1.02)";
    }
  }}
  onMouseLeave={(e) => {
    if (activeCard !== "successful") {
      e.currentTarget.style.borderColor = "#e0e0e0";
      e.currentTarget.style.transform = "scale(1)";
    }
  }}
>
  <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px", fontWeight: "600" }}>
    ✅ Successful {activeCard === "successful" && "⬇️"}
  </div>
  <div style={{ fontSize: "28px", fontWeight: "700", color: "#059669" }}>
    {state.jobResult?.successfulSites || 0}
  </div>
</div>

{/* Failed - CLICKABLE */}
<div
  onClick={() => {
    setActiveCard("failed");
    setShowModal(true);
  }}
  style={{
    background: activeCard === "failed" 
      ? "linear-gradient(135deg, #fee2e2, #fecaca)" 
      : "white",
    padding: "20px",
    borderRadius: "12px",
    border: activeCard === "failed" 
      ? "2px solid #dc2626" 
      : "2px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    transform: activeCard === "failed" ? "scale(1.05)" : "scale(1)",
    boxShadow: activeCard === "failed" 
      ? "0 8px 24px rgba(220, 38, 38, 0.3)" 
      : "none",
  }}
  onMouseEnter={(e) => {
    if (activeCard !== "failed") {
      e.currentTarget.style.borderColor = "#dc2626";
      e.currentTarget.style.transform = "scale(1.02)";
    }
  }}
  onMouseLeave={(e) => {
    if (activeCard !== "failed") {
      e.currentTarget.style.borderColor = "#e0e0e0";
      e.currentTarget.style.transform = "scale(1)";
    }
  }}
>
  <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px", fontWeight: "600" }}>
    ❌ Failed {activeCard === "failed" && "⬇️"}
  </div>
  <div style={{ fontSize: "28px", fontWeight: "700", color: "#dc2626" }}>
    {state.jobResult?.failedSites || 0}
  </div>
</div>

{/* Duration - KHÔNG clickable */}
<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid #e0e0e0",
  }}
>
  <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px", fontWeight: "600" }}>
    ⏱️ Duration
  </div>



  <div style={{ fontSize: "20px", fontWeight: "700", color: "#666" }}>
    {calculateTotalDuration()}
  </div>



</div>



</div>
{/* END Grid Container */}

        {/* // ==================================================================== */}

        {/* Download Section */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "2px solid #e0e0e0",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
            📥 Download Files
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* XML Files */}
            <button
              onClick={handleDownloadXML}
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #1976d2, #1565c0)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "20px" }}>📦</span>
              <span>Download XML Files (ZIP)</span>
            </button>

            {/* Error Report */}
            {state.jobResult && state.jobResult.failedSites > 0 && (
              <button
                onClick={handleDownloadErrorReport}
                style={{
                  padding: "16px 20px",
                  background: "linear-gradient(135deg, #d32f2f, #c62828)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <span>Download Error Report</span>
              </button>
            )}

            {/* Execution Logs */}
            <button
              onClick={handleDownloadLogs}
              style={{
                padding: "16px 20px",
                background: "white",
                color: "#666",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "20px" }}>📄</span>
              <span>Download Execution Logs</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          
          

          

          <button
  onClick={() => {
    // ✅ Reset state trước khi về Step 1
    setState(prev => ({
      ...prev,
      currentStep: 1,
      // KHÔNG reset: uploadedFile, sites (giữ lại)
      // Reset: selections, progress, results
      commissionType: null,          // ← Reset
      uploadedFile: null,            // ← Reset
      sites: [],                     // ← Reset
      // selectedSites: [],             // ← Reset
      executionId: null,             // ← Reset
      templates: [],                 // ← Reset
      // generationProgress: null,      // ← Reset
      // jobResult: null,               // ← Reset
error: null,                   // ← Reset
      // generatedResults: [],          // ← Reset

      selectedSites: [],
      generationProgress: null,
      jobResult: null,
      generatedResults: [],
      currentJobId: null,
      currentExecutionId: null,
      executionTimestamps: {
        generateXML: { startTime: null, endTime: null },
        uploadOSS: { startTime: null, endTime: null },
        executeCommissioning: { startTime: null, endTime: null },
      },
    }));
    
    goToStep(1);
  }}
  style={{
    padding: "14px 32px",
    background: "white",
    color: "#666",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  🔄 New Job
</button>



        </div>
      </div>
      {/* // ==================================================================== */}
      {/* ==================================================================== */}
      {/* MODAL - Hiển thị chi tiết khi click cards */}
      {/* ==================================================================== */}
{showModal && (
  <div
    onClick={() => {
      setShowModal(false);
      setActiveCard(null);
    }}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "1200px",
        maxHeight: "80vh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          padding: "24px",
          borderBottom: "2px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: activeCard === "total" 
            ? "linear-gradient(135deg, #e3f2fd, #bbdefb)" 
            : activeCard === "successful" 
            ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
            : "linear-gradient(135deg, #fee2e2, #fecaca)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            color: activeCard === "total" 
              ? "#1976d2" 
              : activeCard === "successful" 
              ? "#059669" 
              : "#dc2626",
          }}
        >
          {activeCard === "total" && `📊 Total Sites (${state.jobResult?.totalSites || 0})`}
          {activeCard === "successful" && `✅ Successful Sites (${state.jobResult?.successfulSites || 0})`}
          {activeCard === "failed" && `❌ Failed Sites (${state.jobResult?.failedSites || 0})`}
        </h2>
        
        <button
          onClick={() => {
            setShowModal(false);
            setActiveCard(null);
          }}
          style={{
            padding: "8px 16px",
            background: "#f5f5f5",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ✖️ Close
        </button>
      </div>

      {/* Modal Content */}
      <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(80vh - 100px)" }}>
    {/* // ==================================================================== */}

        {/* BẢNG 1: TOTAL SITES */}
        {activeCard === "total" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>IP OAM</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Band 5G</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {state.sites
                .filter(s => s.selected && s.templateMatched)
                .map((site, index) => {
                  // Check if site in results (success or failed)
                  const isSuccess = results?.results?.some((r: any) => r.siteId === site.id && r.status === "success");
                  const isFailed = results?.results?.some((r: any) => r.siteId === site.id && r.status === "failed");
                  
                  return (
                    <tr key={site.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>{site.siteName}</td>
                      <td style={{ padding: "12px" }}>{site.ipOam}</td>
                      <td style={{ padding: "12px" }}>{site.band5g}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {isSuccess && <span style={{ color: "#059669", fontWeight: "600" }}>✅ Success</span>}
                        {isFailed && <span style={{ color: "#dc2626", fontWeight: "600" }}>❌ Failed</span>}
                        {!isSuccess && !isFailed && <span style={{ color: "#999" }}>⏳ Processing</span>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
{/* // ==================================================================== */}

        {/* BẢNG 2: SUCCESSFUL SITES */}
        {activeCard === "successful" && results?.results && (
<>
{/* ✅ THÊM DEBUG NÀY */}
{/*}
    <div style={{ padding: "10px", background: "yellow", marginBottom: "10px" }}>
      <p>Total: {results.results.length}</p>
      <p>Full object: {JSON.stringify(results.results[0])}</p>
      <p>Statuses: {results.results.map((r: any) => r.Status).join(', ')}</p>
    </div>

*/}

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>IP OAM</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Command Output</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.results
                .filter((r: any) => r.status === "success")
                .map((result: any, index: number) => {
                  const site = state.sites.find(s => s.id === result.siteId);
                  return (
                    <tr key={result.siteId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>{site?.siteName || result.siteId}</td>
                      <td style={{ padding: "12px" }}>{site?.ipOam}</td>
                      <td style={{ padding: "12px", fontSize: "12px", color: "#666" }}>
                        {/* {result.Message || "Commissioned successfully"} */}
                        {result.error || "Commissioned successfully"}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <span style={{ color: "#059669", fontWeight: "600" }}>✅ Success</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          </>
        )}
{/* // ==================================================================== */}

        {/* BẢNG 3: FAILED SITES */}
        {activeCard === "failed" && results?.results && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>IP OAM</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Error Message</th>
              </tr>
            </thead>
            <tbody>
              {results.results
                .filter((r: any) => r.status === "failed")
                .map((result: any, index: number) => {
                  const site = state.sites.find(s => s.id === result.siteId);
                  return (
                    <tr key={result.siteId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>{site?.siteName ||   result.siteId}</td>
                      <td style={{ padding: "12px" }}>{site?.ipOam}</td>
                      <td style={{ padding: "12px", color: "#dc2626", fontSize: "13px" }}>
                        {/* {result.ErrorMessage || "Unknown error"} */}
                        {result.error || "Unknown error"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
  // ====================================================================




)}

    {/* // ==================================================================== */}
    </div>
  );
};

export default R007GeneratorPnPStep6;