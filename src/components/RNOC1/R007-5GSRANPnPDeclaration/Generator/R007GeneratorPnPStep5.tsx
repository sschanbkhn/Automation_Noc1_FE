
// R007GeneratorStep5.tsx
// import React, { useState, useEffect } from "react";
// import { GeneratorState } from "./R007generatorTypes";
import { R007GeneratorService } from "./R007GeneratorService";
// import { GeneratedFileResult } from "./R007generatorTypes"; // ← THÊM import này





import API_CONFIG from "../Designer/ApiR0075GSRANPnPDeclarationConfig";

// R007GeneratorStep5.tsx
// import React, { useState, useEffect } from "react";
import { GeneratorState, GeneratedFileResult } from "./R007generatorTypes"; // ← THÊM GeneratedFileResult
// import { R007GeneratorService } from "./R007GeneratorService";

import React, { useState, useEffect, useRef } from "react"; // ← THÊM useRef


interface Step5Props {
  state: GeneratorState;
  setState: React.Dispatch<React.SetStateAction<GeneratorState>>;
  goToStep: (step: number) => void;
}






const R007GeneratorPnPStep5: React.FC<Step5Props> = ({
  state,
  setState,
  goToStep,
}) => {
  
  // ← PASTE TOÀN BỘ CODE case 5 vào đây (bỏ "case 5:" và "break;")
const [isGenerating, setIsGenerating] = useState(false);
const [currentJobId, setCurrentJobId] = useState<string | null>(null);
const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
// const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
// ✅ THÊM dòng này:
const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    //========================================================================

    // ← THÊM state này:
const [activeCard, setActiveCard] = useState<"total" | "generated" | "failed" | null>(null);
const [showModal, setShowModal] = useState(false); // ← THÊM state này
//========================================================================


// ← THÊM states cho View XML:
const [showXMLModal, setShowXMLModal] = useState(false);
const [selectedXMLContent, setSelectedXMLContent] = useState<string>("");
const [selectedFileName, setSelectedFileName] = useState<string>("");

const [showTimelineModal, setShowTimelineModal] = useState(false); // ← THÊM dòng này
    
  const handleStartGeneration = async () => {
  setIsGenerating(true);
  
  try {
    console.log("📤 Step 1: Generating XML files...");
    
    // Chuẩn bị data
    const selectedSites = state.sites.filter(s => s.selected && s.templateMatched);
    //========================================================================

    const generateStartTime = new Date();
    // ====================================================================
    // STEP 1: GENERATE XML - START
    // ====================================================================

    // ← THÊM: Update UI với số sites
    setState(prev => ({
      ...prev,
      executionTimestamps: {
        ...prev.executionTimestamps,
        generateXML: { startTime: generateStartTime, endTime: null }
      },
      generationProgress: {
        currentStep: 0,
        totalSteps: selectedSites.length,
        percentage: 0,
        currentSite: "Preparing...",
        completedSites: 0,
        failedSites: 0,
        totalSites: selectedSites.length,
        message: `Preparing to generate ${selectedSites.length} XML files...`
        
      }
    }));
//========================================================================


    // API 2: Generate XML
    const generateResult = await R007GeneratorService.generateXML({
      commissionType: state.commissionType!,
      sites: selectedSites.map(site => ({
        id: site.id,
        siteName: site.siteName,
        templateId: site.templateMatched!,
        ipOam: site.ipOam,
        band5g: site.band5g,
        rrh5g: site.rrh5g,
        // TODO: Map thêm fields khác
      }))
    });
    //========================================================================

        // ← THÊM check này:
if (!generateResult || !generateResult.generatedFiles) {
  console.error("❌ API response invalid:", generateResult);
  throw new Error("Invalid API response");
}

        // ← THÊM: Hiển thị kết quả
    const successCount = generateResult.generatedFiles.filter(f => f.status === "success").length;
    const failCount = generateResult.generatedFiles.filter(f => f.status === "failed").length;
    //========================================================================

    console.log(`✅ Generated ${successCount} files successfully, ${failCount} failed`);
    
    // ← LƯU jobId để download sau
    setCurrentJobId(generateResult.jobId);
//========================================================================

// STEP 1: GENERATE XML - END
    const generateEndTime = new Date();
//========================================================================

// ← setState lần 2: CÓ generatedResults (sau khi có data)
    setState(prev => ({
      ...prev,
      generatedResults: generateResult.generatedFiles, // ← BÂY GIỜ MỚI set

executionTimestamps: { // ← THÊM
    ...prev.executionTimestamps,
    generateXML: { startTime: generateStartTime, endTime: generateEndTime }
  },

      generationProgress: {
        currentStep: successCount,
        totalSteps: selectedSites.length,
        percentage: 100,
        currentSite: "Generation completed",
        completedSites: successCount,
        failedSites: failCount,
        totalSites: selectedSites.length,
        message: `✅ Generated ${successCount} files successfully! ${failCount > 0 ? `(${failCount} failed)` : ''}`
      }
    }));
 //========================================================================

    console.log(`✅ Generated XML files: ${successCount} success, ${failCount} failed`);

    console.log("📄 Generated files detail:", generateResult);
    console.log("✅ All done! jobId:", generateResult.jobId);
    
    const jobId = generateResult.jobId;
    setCurrentJobId(jobId);

// ✅ THÊM: Lưu vào global state
setState(prev => ({
  ...prev,
  currentJobId: jobId // ← Lưu vào state
}));

    console.log("✅ Generated XML files, jobId:", jobId);
    //========================================================================

    // ====================================================================
    // STEP 2: UPLOAD TO OSS - START
    // ====================================================================

    // API 4: Upload to OSS
    // ====================================================================
// STEP 2: UPLOAD TO OSS - START
// ====================================================================
    const uploadStartTime = new Date();
    console.log("📤 Step 2: Uploading to OSS Netact...");


    // Set start time vào state
setState(prev => ({
  ...prev,
  executionTimestamps: {
    ...prev.executionTimestamps,
    uploadOSS: { startTime: uploadStartTime, endTime: null }
  }
}));
//========================================================================

    const uploadResult = await R007GeneratorService.uploadToOSS(
      jobId, 
      state.commissionType!
    );
    //========================================================================

    console.log("✅ Uploaded to OSS, ossJobId:", uploadResult.ossJobId);

        // STEP 2: UPLOAD TO OSS - END
const uploadEndTime = new Date();
//========================================================================

// Set end time vào state
setState(prev => ({
  ...prev,
  executionTimestamps: {
    ...prev.executionTimestamps,
    uploadOSS: { startTime: uploadStartTime, endTime: uploadEndTime }
  }
}));

console.log("✅ Uploaded to OSS, ossJobId:", uploadResult.ossJobId);
    //========================================================================



        // ====================================================================
// STEP 3: EXECUTE COMMISSIONING - START
// ====================================================================
    // API 5: Execute Commissioning
    console.log("📤 Step 3: Triggering commissioning job...");
    const executeStartTime = new Date();
//========================================================================

// Set start time vào state
setState(prev => ({
  ...prev,
  executionTimestamps: {
    ...prev.executionTimestamps,
    executeCommissioning: { startTime: executeStartTime, endTime: null }
  }
}));
//========================================================================

// Gọi API execute
    const executeResult = await R007GeneratorService.executeCommissioning(
      uploadResult.ossJobId,
      state.commissionType!
    );
    //========================================================================

    const executionId = executeResult.executionId;
    setCurrentExecutionId(executionId);
// ✅ THÊM: Lưu vào state để truyền sang Step 6
setState(prev => ({
  ...prev,
  currentExecutionId: executionId
}));


    
    console.log("✅ Job started, executionId:", executionId);
    
    // Start polling
    startPolling(executionId);
//========================================================================

    console.log("✅ All done! Ready to download.");
    //========================================================================

  } catch (error) {
    console.error("❌ Error:", error);
    setState(prev => ({
      ...prev,
      error: error instanceof Error ? error.message : "Unknown error"
    }));
    setIsGenerating(false);
  }
};
      //========================================================================

      // ====================================================================
// Start Polling - Gọi API 6 liên tục mỗi 2 giây
// ====================================================================
const startPolling = (executionId: string) => {
  // Poll ngay lập tức
  pollJobStatus(executionId);
  
  // Sau đó poll mỗi 2 giây
  const interval = setInterval(() => {
    pollJobStatus(executionId);
  }, 2000); // 2 seconds

  pollingIntervalRef.current = interval; // ← Dùng ref
  
  // setPollingInterval(interval);
};

// ====================================================================
// Poll Job Status - API 6
// ====================================================================
const pollJobStatus = async (executionId: string) => {
  try {
    const status = await R007GeneratorService.getJobStatus(executionId);
    
    console.log(`📊 Progress: ${status.progress.percentage}%`);
    
    // Update state với progress
    // ✅ MỚI - Thêm currentStep và totalSteps:
setState(prev => ({
  ...prev,
  generationProgress: {
    currentStep: status.progress.completedSites,
    totalSteps: status.progress.totalSites,
    percentage: status.progress.percentage,
    currentSite: status.progress.currentSite,
    completedSites: status.progress.completedSites,
    failedSites: status.progress.failedSites,
    totalSites: status.progress.totalSites,
    message: status.message,
  }
}));
    
    // Nếu hoàn thành → stop polling, chuyển Step 6
    if (status.status === "completed") {
      console.log("✅ Job completed!");
      const executeEndTime = new Date(); // ← THÊM

      // ← THÊM: Record end time
setState(prev => ({ // ← THÊM
    ...prev,
    executionTimestamps: {
      ...prev.executionTimestamps,
      executeCommissioning: {
        ...prev.executionTimestamps.executeCommissioning,
        endTime: executeEndTime
      }
    }
  }));

  // ✅ CRITICAL: Stop polling NGAY
      stopPolling();
      setIsGenerating(false);
      // ====================================================================

      // Chờ 1 giây rồi chuyển Step 6
      // Navigate to Step 6 after 1 second
      setTimeout(() => {
        goToStep(6);
      }, 1000);

      return; // ← THÊM return để không chạy code bên dưới

    }
    
    // Nếu failed → stop polling
    if (status.status === "failed") {
      console.error("❌ Job failed!");
      stopPolling();
      setIsGenerating(false);
      setState(prev => ({
        ...prev,
        error: "Commissioning job failed"
      }));
    }
    
  } catch (error) {
    console.error("❌ Polling error:", error);
  }
};

// ====================================================================
// Stop Polling
// ====================================================================
const stopPolling = () => {
  if (pollingIntervalRef.current) { // ← Dùng ref
    clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = null;
    console.log("🛑 Polling stopped"); // ← Log để debug
  }
};
// ====================================================================

const handleViewXML = async (file: GeneratedFileResult) => {
  try {
    console.log("🔍 Loading XML content for:", file.fileName);
    
    // TODO: Gọi API backend để lấy XML content
    // const response = await fetch(`/api/.../xml-content/${currentJobId}/${file.fileName}`);
    // const xmlContent = await response.text();
    
    /*
    // MOCK: Tạm thời dùng mock data

    const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <site>
    <name>${file.siteId}</name>
    <fileName>${file.fileName}</fileName>
    <generated>${new Date().toISOString()}</generated>
  </site>
  <network>
    <ipAddress>192.168.1.100</ipAddress>
    <vlan>100</vlan>
    <gateway>192.168.1.1</gateway>
  </network>
  <!-- Full XML content here -->
</configuration>`;

    
    setSelectedXMLContent(mockXML);
    setSelectedFileName(file.fileName);
    setShowXMLModal(true);
*/

    // ✅ GỌI API THẬT
// ✅ Dùng state.currentJobId thay vì currentJobId local
    const xmlContent = await R007GeneratorService.getXMLFileContent(
      state.currentJobId!, // ← SỬA: từ currentJobId → state.currentJobId
      file.fileName
    );





    setSelectedXMLContent(xmlContent);
    setSelectedFileName(file.fileName);
    setShowXMLModal(true);
    
  } catch (error) {
    console.error("❌ Error loading XML:", error);
    alert("Failed to load XML content");
  }
};
// ====================================================================



const handleDownloadXML = (file: GeneratedFileResult) => {
  try {
    console.log("📥 Downloading XML:", file.fileName);
    
    // Download single file
    // const downloadUrl = `${API_CONFIG.BASE_URL}/generator/download-file/${currentJobId}/${file.fileName}`;
    // Download single file - sử dụng API mới
    // const downloadUrl = `${API_CONFIG.BASE_URL}/generator/download-file/${currentJobId}/${file.fileName}`;
    // ✅ Dùng state.currentJobId
    const downloadUrl = `${API_CONFIG.BASE_URL}/generator/download-file/${state.currentJobId}/${file.fileName}`;
    

    // Mở URL trong tab mới → Browser tự động download
    window.open(downloadUrl, '_blank');
    
    // Hoặc dùng cách này (tạo link ẩn):
    // const link = document.createElement('a');
    // link.href = downloadUrl;
    // link.download = file.fileName;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    
  } catch (error) {
    console.error("❌ Error downloading XML:", error);
    alert("Failed to download file");
  }
};
// ====================================================================




// Cleanup khi component unmount
useEffect(() => {
  return () => {
    stopPolling();
  };
}, []);




// ====================================================================
// Helper: Format Duration từ timestamps
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







  return (
    <div className="r007-step-content" style={{ height: "500px" }}>
     

            {/* HEADER - Style như ảnh */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // padding: "24px 40px",
                // padding: "16px 40px", // ← ĐỔI: từ 24px → 16px
                padding: "12px 40px", // ← ĐỔI: từ 16px → 12px (giảm chiều cao)
                background: "white",
                // borderRadius: "12px",
                borderRadius: "12px 12px 0 0", // ← ĐỔI: chỉ bo tròn trên, dưới phẳng
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginTop: "-40px", // ← THÊM DÒNG NÀY
                // marginBottom: "30px",
                marginBottom: "24px", // ← ĐỔI: từ 30px → 24px
                marginLeft: "-40px",
                marginRight: "-40px",
                width: "calc(100% + 80px)",
              }}
            >
              {/* Left: Icon + Title + Subtitle */}
              {/* </div><div style={{ display: "flex", alignItems: "center", gap: "20px" }}>*/}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {" "}
                {/* ← ĐỔI: gap từ 20px → 16px */}
                {/* Icon Gradient */}
                <div
                  style={{
                    // width: "72px",
                    // height: "72px",
                    // borderRadius: "18px",
                    width: "56px", // ← ĐỔI: từ 72px → 56px
                    height: "56px", // ← ĐỔI: từ 72px → 56px
                    borderRadius: "14px", // ← ĐỔI: từ 18px → 14px
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // margin: "0 auto 20px auto", // ← ĐỔI: từ marginBottom → margin (tự động căn giữa)
                    marginLeft: "-20px",
                    // boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
                    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.3)", // ← ĐỔI: từ 8px → 6px
                  }}
                >
                  ⚡
                </div>
                {/* Title + Subtitle */}
                <div>
                  <h1
                    style={{
                      margin: 0,
                      // fontSize: "28px",
                      fontSize: "24px", // ← ĐỔI: từ 28px → 24px
                      fontWeight: "700",
                      color: "#1a202c",
                      lineHeight: "1.2", // ← THÊM
                    }}
                  >
                    Step 5: Generate XML Files
                  </h1>
                  <p
                    style={{
                      // margin: "4px 0 0 0",
                      // fontSize: "15px",
                      color: "#64748b",
                      margin: "2px 0 0 0", // ← ĐỔI: từ 4px → 2px
                      fontSize: "14px", // ← ĐỔI: từ 15px → 14px
                    }}
                  >
                    Create configuration files for selected sites
                  </p>
                </div>
              </div>

              {/* Right: Commission Type Badge */}
              {state.commissionType && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    // gap: "12px",
                    // padding: "16px 24px",
                    background: "white",
                    border: "2px solid #e0e0e0",
                    // borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    gap: "10px", // ← ĐỔI: từ 12px → 10px
                    padding: "12px 20px", // ← ĐỔI: từ 16px 24px → 12px 20px
                    borderRadius: "12px", // ← ĐỔI: từ 16px → 12px
                    marginRight: "-20px",
                  }}
                >
                  <div
                    style={{
                      // width: "48px",
                      // height: "48px",
                      // borderRadius: "12px",
                      width: "40px", // ← ĐỔI: từ 48px → 40px
                      height: "40px", // ← ĐỔI: từ 48px → 40px
                      borderRadius: "10px", // ← ĐỔI: từ 12px → 10px
                      background: state.commissionType === "SiteConfig" ? "linear-gradient(135deg, #f97316, #ea580c)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: state.commissionType === "SiteConfig" ? "0 4px 12px rgba(249, 115, 22, 0.3)" : "0 4px 12px rgba(139, 92, 246, 0.3)",
                      // fontSize: "24px",
                      fontSize: "20px", // ← ĐỔI: từ 24px → 20px
                    }}
                  >
                    {state.commissionType === "SiteConfig" ? "🛠️" : "⚡"}
                  </div>
                  <div>
                    <div
                      style={{
                        // fontSize: "11px",
                        fontSize: "10px", // ← ĐỔI: từ 11px → 10px
                        color: "#999",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        //marginBottom: "4px",
                        marginBottom: "3px", // ← ĐỔI: từ 4px → 3px
                      }}
                    >
                      Commission Type
                    </div>

                    <div
                      style={{
                        // fontSize: "16px",
                        fontWeight: "700",
                        color: "#333",
                        fontSize: "15px", // ← ĐỔI: từ 16px → 15px
                      }}
                    >
                      {state.commissionType === "SiteConfig" ? "Site Configuration" : "Auto PnP"}
                    </div>
                  </div>
                </div>
              )}
            </div>


      
      {/* CONTENT - Cần thêm UI */}
      {/* <p className="r007-placeholder">🚧 Generation progress UI - Coming soon</p> */}
      {/* CONTENT */}
<div
  style={{
    marginLeft: "-40px",
    marginRight: "-40px",
    paddingLeft: "40px",
    paddingRight: "40px",
  }}
>
  {/* Summary Stats */}
  




{/* Summary Stats - CLICKABLE CARDS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  }}
>
  {/* Total Sites Card - CLICKABLE */}
  <div
    onClick={() => { setActiveCard("total");
    setShowModal(true);  // ← Mở modal)}
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
      {state.sites.filter(s => s.selected && s.templateMatched).length}
    </div>
  </div>

  {/* Generated Card - CLICKABLE */}
  <div
    onClick={() => {
    setActiveCard("generated");
    setShowModal(true); // ← Mở modal
  }}
    style={{
      background: activeCard === "generated" 
        ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
        : "white",
      padding: "20px",
      borderRadius: "12px",
      border: activeCard === "generated" 
        ? "2px solid #059669" 
        : "2px solid #e0e0e0",
      cursor: "pointer",
      transition: "all 0.3s ease",
      transform: activeCard === "generated" ? "scale(1.05)" : "scale(1)",
      boxShadow: activeCard === "generated" 
        ? "0 8px 24px rgba(5, 150, 105, 0.3)" 
        : "none",
    }}
    onMouseEnter={(e) => {
      if (activeCard !== "generated") {
        e.currentTarget.style.borderColor = "#059669";
        e.currentTarget.style.transform = "scale(1.02)";
      }
    }}
    onMouseLeave={(e) => {
      if (activeCard !== "generated") {
        e.currentTarget.style.borderColor = "#e0e0e0";
        e.currentTarget.style.transform = "scale(1)";
      }
    }}
  >
    <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px", fontWeight: "600" }}>
      ✅ Generated {activeCard === "generated" && "⬇️"}
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700", color: "#059669" }}>
      {state.generationProgress?.completedSites || 0}
    </div>
  </div>

  {/* Failed Card - CLICKABLE */}
  <div
    onClick={() => {
    setActiveCard("failed");
    setShowModal(true); // ← Mở modal
  
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
      {state.generationProgress?.failedSites || 0}
    </div>
  </div>

  {/* Progress % Card - KHÔNG clickable */}
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      border: "2px solid #e0e0e0",
    }}
  >
    <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px", fontWeight: "600" }}>
      📈 Progress
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700", color: "#8b5cf6" }}>
      {state.generationProgress?.percentage || 0}%
    </div>
  </div>
</div>


  

  {/* Progress Bar */}
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      border: "2px solid #e0e0e0",
      marginBottom: "24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
        {state.generationProgress?.message || "Ready to generate"}
      </span>
      <span style={{ fontSize: "14px", fontWeight: "600", color: "#8b5cf6" }}>
        {state.generationProgress?.completedSites || 0} / {state.sites.filter(s => s.selected && s.templateMatched).length}
      </span>
    </div>

    {/* Progress bar */}
    <div
      style={{
        width: "100%",
        height: "24px",
        background: "#f0f0f0",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${state.generationProgress?.percentage || 0}%`,
          height: "100%",
          background: "linear-gradient(90deg, #8b5cf6, #7c3aed)",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  </div>



{/* ← THÊM 3 BẢNG VÀO ĐÂY (TRƯỚC Action Buttons) */}

{/* ====================================================================
    BẢNG 1: TOTAL SITES (khi click Total card)
==================================================================== */}
{activeCard === "total" && (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      border: "2px solid #1976d2",
      marginBottom: "24px",
      boxShadow: "0 8px 24px rgba(25, 118, 210, 0.2)",
    }}
  >
    <h3 style={{ 
      margin: "0 0 16px 0", 
      fontSize: "18px", 
      fontWeight: "700", 
      color: "#1976d2" 
    }}>
      📊 Total Sites ({state.sites.filter(s => s.selected && s.templateMatched).length})
    </h3>
    
    <div style={{ overflowX: "auto" }}>
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse",
        fontSize: "14px" 
      }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>IP OAM</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Band 5G</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Template</th>
          </tr>
        </thead>
        <tbody>
          {state.sites
            .filter(s => s.selected && s.templateMatched)
            .map((site, index) => (
              <tr 
                key={site.id}
                style={{
                  borderBottom: "1px solid #e0e0e0",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px", fontWeight: "600" }}>{site.siteName}</td>
                <td style={{ padding: "12px" }}>{site.ipOam}</td>
                <td style={{ padding: "12px" }}>{site.band5g}</td>
                <td style={{ padding: "12px", fontSize: "12px", color: "#666" }}>
                  {site.templateMatched}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{/* ====================================================================
    BẢNG 2: GENERATED FILES (khi click Generated card)
==================================================================== */}
{activeCard === "generated" && state.generatedResults && (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      border: "2px solid #059669",
      marginBottom: "24px",
      boxShadow: "0 8px 24px rgba(5, 150, 105, 0.2)",
    }}
  >
    <h3 style={{ 
      margin: "0 0 16px 0", 
      fontSize: "18px", 
      fontWeight: "700", 
      color: "#059669" 
    }}>
      ✅ Generated Files ({state.generatedResults.filter(f => f.status === "success").length})
    </h3>
    
    <div style={{ overflowX: "auto" }}>
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse",
        fontSize: "14px" 
      }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>File Name</th>
            <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.generatedResults
            .filter(f => f.status === "success")
            .map((file, index) => {
              const site = state.sites.find(s => s.id === file.siteId);
              return (
                <tr 
                  key={file.siteId}
                  style={{
                    borderBottom: "1px solid #e0e0e0",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0fdf4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <td style={{ padding: "12px" }}>{index + 1}</td>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{site?.siteName}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                    {file.fileName}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => {
                        // TODO: View XML content
                        console.log("🔍 View file:", file.fileName);
                      }}
                      style={{
                        padding: "6px 16px",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      👁️ View
                    </button>
                    
                    <button
                      onClick={() => {
                        // TODO: Download XML file
                        console.log("📥 Download file:", file.fileName);
                      }}
                      style={{
                        padding: "6px 16px",
                        background: "linear-gradient(135deg, #059669, #047857)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      💾 Download
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
)}

{/* ====================================================================
    BẢNG 3: FAILED FILES (khi click Failed card)
==================================================================== */}
{activeCard === "failed" && state.generatedResults && (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      border: "2px solid #dc2626",
      marginBottom: "24px",
      boxShadow: "0 8px 24px rgba(220, 38, 38, 0.2)",
    }}
  >
    <h3 style={{ 
      margin: "0 0 16px 0", 
      fontSize: "18px", 
      fontWeight: "700", 
      color: "#dc2626" 
    }}>
      ❌ Failed Files ({state.generatedResults.filter(f => f.status === "failed").length})
    </h3>
    
    <div style={{ overflowX: "auto" }}>
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse",
        fontSize: "14px" 
      }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>File Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {state.generatedResults
            .filter(f => f.status === "failed")
            .map((file, index) => {
              const site = state.sites.find(s => s.id === file.siteId);
              return (
                <tr 
                  key={file.siteId}
                  style={{
                    borderBottom: "1px solid #e0e0e0",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  <td style={{ padding: "12px" }}>{index + 1}</td>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{site?.siteName}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                    {file.fileName}
                  </td>
                  <td style={{ padding: "12px", color: "#dc2626", fontSize: "13px" }}>
                    {file.error || "Unknown error"}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
)}












  {/* Action Buttons */}
  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
    {!state.generationProgress && (
      <button
        onClick={() => {
          // TODO: Call API - POST /api/generator/generate-xml
          //========================================================================



          handleStartGeneration();  // ← THÊM dòng này
          console.log("🔄 Starting XML generation...");
        }}
        disabled={isGenerating}
        style={{
          padding: "14px 32px",
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
        }}
      >
        🚀 Start Generation
      </button>
    )}

{/* Button View Results + Continue */}
    {state.generationProgress?.percentage === 100 && (
      <button
        // onClick={() => goToStep(6)}
        // ❌ KHÔNG PHẢI: onClick={() => goToStep(6)}
        onClick={() => setShowTimelineModal(true)} // ← ĐÚNG: Mở modal
        style={{
          padding: "14px 32px",
          background: "linear-gradient(135deg, #059669, #047857)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
        }}
      >
        ✅ View Results
      </button>
    )}
  </div>
</div>


{/* ====================================================================
    MODAL - Hiển thị bảng khi click card
==================================================================== */}
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
      onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào modal
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
            : activeCard === "generated" 
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
              : activeCard === "generated" 
              ? "#059669" 
              : "#dc2626",
          }}
        >
          {activeCard === "total" && `📊 Total Sites (${state.sites.filter(s => s.selected && s.templateMatched).length})`}
          {activeCard === "generated" && `✅ Generated Files (${state.generatedResults?.filter((f: GeneratedFileResult) => f.status === "success").length || 0})`}
          {activeCard === "failed" && `❌ Failed Files (${state.generatedResults?.filter((f: GeneratedFileResult) => f.status === "failed").length || 0})`}
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

      {/* Modal Content - Scrollable */}
      <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(80vh - 100px)" }}>
        
        {/* BẢNG 1: TOTAL SITES */}
        {activeCard === "total" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>IP OAM</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Band 5G</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Template</th>
              </tr>
            </thead>
            <tbody>
              {state.sites
                .filter(s => s.selected && s.templateMatched)
                .map((site, index) => (
                  <tr key={site.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px" }}>{index + 1}</td>
                    <td style={{ padding: "12px", fontWeight: "600" }}>{site.siteName}</td>
                    <td style={{ padding: "12px" }}>{site.ipOam}</td>
                    <td style={{ padding: "12px" }}>{site.band5g}</td>
                    <td style={{ padding: "12px", fontSize: "12px", color: "#666" }}>{site.templateMatched}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* BẢNG 2: GENERATED FILES */}
        {activeCard === "generated" && state.generatedResults && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>File Name</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.generatedResults
                .filter((f: GeneratedFileResult) => f.status === "success")
                .map((file: GeneratedFileResult, index: number) => {
                  const site = state.sites.find(s => s.id === file.siteId);
                  return (
                    <tr key={file.siteId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>{site?.siteName}</td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>{file.fileName}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {/* ✅ DÙNG onClick mới: */}
                        <button

                          

                  onClick={() => handleViewXML(file)}
                  
                          style={{
                            padding: "6px 16px",
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            marginRight: "8px",
                          }}
                        >
                          👁️ View
                        </button>
                        <button
                  onClick={() => handleDownloadXML(file)}
                  style={{
                    padding: "6px 16px",
                    background: "linear-gradient(135deg, #059669, #047857)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >

                  
                          💾 Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {/* BẢNG 3: FAILED FILES */}
        {activeCard === "failed" && state.generatedResults && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Site Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>File Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {state.generatedResults
                .filter((f: GeneratedFileResult) => f.status === "failed")
                .map((file: GeneratedFileResult, index: number) => {
                  const site = state.sites.find(s => s.id === file.siteId);
                  return (
                    <tr key={file.siteId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>{site?.siteName}</td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>{file.fileName}</td>
                      <td style={{ padding: "12px", color: "#dc2626", fontSize: "13px" }}>
                        {file.error || "Unknown error"}
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
)}




{/* ====================================================================
    XML CONTENT MODAL - Hiển thị nội dung XML
==================================================================== */}
{showXMLModal && (
  <div
    onClick={() => {
      setShowXMLModal(false);
      setSelectedXMLContent("");
      setSelectedFileName("");
    }}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000, // Cao hơn modal cards
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "1000px",
        maxHeight: "80vh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "2px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "white" }}>
            📄 XML Content
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#e0e0e0" }}>
            {selectedFileName}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Download button */}
          <button
            onClick={() => {
              // Download this file
              const blob = new Blob([selectedXMLContent], { type: 'application/xml' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = selectedFileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: "8px 16px",
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            💾 Download
          </button>
          
          {/* Close button */}
          <button
            onClick={() => {
              setShowXMLModal(false);
              setSelectedXMLContent("");
              setSelectedFileName("");
            }}
            style={{
              padding: "8px 16px",
              background: "#f5f5f5",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              color: "#333",
            }}
          >
            ✖️ Close
          </button>
        </div>
      </div>

      {/* XML Content - Scrollable with syntax highlighting */}
      <div style={{ 
        padding: "24px", 
        overflowY: "auto", 
        maxHeight: "calc(80vh - 120px)",
        background: "#1e1e1e", // Dark background like code editor
      }}>
        <pre style={{
          margin: 0,
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#d4d4d4", // Light text
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}>
          {selectedXMLContent}
        </pre>
      </div>
    </div>
  </div>
)}



{/* ====================================================================
    TIMELINE MODAL - Hiển thị toàn bộ quá trình execution
==================================================================== */}
{showTimelineModal && (
  <div
    onClick={() => setShowTimelineModal(false)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10001,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "80vh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "2px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "white" }}>
          📊 Execution Timeline
        </h2>
        
        <button
          onClick={() => setShowTimelineModal(false)}
          style={{
            padding: "8px 16px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "2px solid white",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            color: "white",
          }}
        >
          ✖️ Close
        </button>
      </div>

      {/* Timeline Content */}
      <div style={{ 
        padding: "32px", 
        overflowY: "auto", 
        maxHeight: "calc(80vh - 100px)" 
      }}>

        {/* ✅ DEBUG */}
        {/*}
  <div style={{ padding: "10px", background: "yellow", marginBottom: "20px" }}>
    <p>currentExecutionId (local): {currentExecutionId || 'NULL'}</p>
    <p>state.currentExecutionId (global): {state.currentExecutionId || 'NULL'}</p>
    <p>Upload startTime: {state.executionTimestamps.uploadOSS.startTime?.toString() || 'NULL'}</p>
    <p>Upload endTime: {state.executionTimestamps.uploadOSS.endTime?.toString() || 'NULL'}</p>
    <p>Execute startTime: {state.executionTimestamps.executeCommissioning.startTime?.toString() || 'NULL'}</p>
  </div>

  */}
        
        {/* Step 1: Generate XML Files */}
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          marginBottom: "32px",
          position: "relative" 
        }}>
          {/* Icon */}
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: state.generationProgress ? "linear-gradient(135deg, #059669, #047857)" : "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            flexShrink: 0,
            boxShadow: state.generationProgress ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
          }}>
            {state.generationProgress ? "✅" : "⏳"}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "18px", 
              fontWeight: "700",
              color: "#1a202c" 
            }}>
              Step 1: Generate XML Files
            </h3>
            
            {state.generationProgress && (
              <>
                <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                  ⏱️ Duration: {formatDuration(
    state.executionTimestamps.generateXML.startTime,
    state.executionTimestamps.generateXML.endTime
  )}
                  {/* ❌ XÓA: ⏱️ Duration: ~5 seconds */}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                  📄 Files: {state.generationProgress.totalSites} generated 
                  ({state.generationProgress.completedSites} ✅ {state.generationProgress.failedSites} ❌)
                </p>
                <div style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  background: "#d1fae5",
                  borderLeft: "4px solid #059669",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#065f46",
                }}>
                  {state.generationProgress.message}
                </div>
              </>
            )}
          </div>

          {/* Vertical line */}
          {state.generationProgress && (
            <div style={{
              position: "absolute",
              left: "23px",
              top: "56px",
              width: "2px",
              height: "40px",
              background: "#e0e0e0",
            }} />
          )}
        </div>

        {/* Step 2: Upload to OSS (if started) */}
        {state.generationProgress && (
          <div style={{ 
            display: "flex", 
            gap: "20px", 
            marginBottom: "32px",
            position: "relative" 
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: currentExecutionId ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            }}>
              {state.currentExecutionId ? "✅" : "🔄"}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: "0 0 8px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#1a202c" 
              }}>
                Step 2: Upload to OSS Netact
              </h3>
              
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                ⏱️ Duration: {formatDuration(
    state.executionTimestamps.uploadOSS.startTime,
    state.executionTimestamps.uploadOSS.endTime
      )}
                {/* ❌ XÓA: ⏱️ Duration: ~3 seconds */}
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                📤 Files: {state.generationProgress.completedSites} uploaded
              </p>
              
              {state.currentExecutionId && (
                <div style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  background: "#d1fae5",
                  borderLeft: "4px solid #059669",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#065f46",
                }}>
                  ✅ Upload completed successfully
                </div>
              )}
            </div>

            {state.currentExecutionId && (
              <div style={{
                position: "absolute",
                left: "23px",
                top: "56px",
                width: "2px",
                height: "40px",
                background: "#e0e0e0",
              }} />
            )}
          </div>
        )}

        {/* Step 3: Execute Commissioning (if started) */}
        {state.currentExecutionId && (
          <div style={{ 
            display: "flex", 
            gap: "20px", 
            marginBottom: "32px" 
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: state.generationProgress.percentage === 100 
                ? "linear-gradient(135deg, #059669, #047857)" 
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            }}>
              {state.generationProgress.percentage === 100 ? "✅" : "🔄"}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: "0 0 8px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#1a202c" 
              }}>
                Step 3: Execute Commissioning
              </h3>
              
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                ⏱️ Duration: {formatDuration(
    state.executionTimestamps.executeCommissioning.startTime,
    state.executionTimestamps.executeCommissioning.endTime
  )}
                {/* ❌ XÓA: ⏱️ Duration: ~45 minutes (estimated) */}
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                ⚙️ Progress: {state.generationProgress.percentage}% 
                ({state.generationProgress.completedSites}/{state.generationProgress.totalSites} sites)
              </p>
              
              {/* Progress bar */}
              <div style={{
                marginTop: "12px",
                width: "100%",
                height: "8px",
                background: "#f0f0f0",
                borderRadius: "4px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${state.generationProgress.percentage}%`,
                  height: "100%",
                  background: state.generationProgress.percentage === 100 
                    ? "linear-gradient(90deg, #059669, #047857)" 
                    : "linear-gradient(90deg, #f59e0b, #d97706)",
                  transition: "width 0.3s ease",
                }} />
              </div>

              <div style={{
                marginTop: "8px",
                padding: "8px 12px",
                background: state.generationProgress.percentage === 100 ? "#d1fae5" : "#fef3c7",
                borderLeft: `4px solid ${state.generationProgress.percentage === 100 ? "#059669" : "#f59e0b"}`,
                borderRadius: "4px",
                fontSize: "13px",
                color: state.generationProgress.percentage === 100 ? "#065f46" : "#92400e",
              }}>
                {state.generationProgress.percentage === 100 
                  ? "✅ Commissioning completed!" 
                  : `🔄 ${state.generationProgress.message}`}
              </div>
            </div>
          </div>
        )}


        {/* Step 4: Waiting (if not started yet) */}
        {/*!currentExecutionId && state.generationProgress && ( */}
          {/* Step 4: Waiting - CHỈ hiện khi đã gen NHƯNG chưa upload */}
{!currentExecutionId && state.generationProgress && 
 !state.executionTimestamps.uploadOSS.startTime && (
          <div style={{ 
            display: "flex", 
            gap: "20px", 
            marginBottom: "32px" 
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
            }}>
              ⏳
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: "0 0 8px 0", 
                fontSize: "18px", 
                fontWeight: "700",
                color: "#999" 
              }}>
                Step 2-3: Waiting...
              </h3>
              <p style={{ margin: "4px 0", fontSize: "14px", color: "#999" }}>
                Upload and commissioning will start automatically
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  </div>
)}










    </div>
  );
};

export default R007GeneratorPnPStep5;