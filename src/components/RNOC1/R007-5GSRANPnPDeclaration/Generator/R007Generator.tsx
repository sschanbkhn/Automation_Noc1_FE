// R007Generator.tsx
// Main Generator component - manages 6-step workflow

// import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import { FiUpload, FiTool, FiZap, FiGrid } from "react-icons/fi"; // ← THÊM DÒNG NÀY
import { FiUploadCloud } from "react-icons/fi";
import "./R007Generator.css";
// import * as XLSX from "xlsx"; // ← THÊM DÒNG NÀY
import * as ExcelJS from "exceljs"; // ← THÊM DÒNG NÀY
import { GeneratorState, CommissionType, SiteData } from "./R007generatorTypes";
import { mockSitesData } from "./R007generatorMockData";
import { R007TemplateService, TemplateFile, TemplateListResponse } from "./R007TemplateService";

import R007GeneratorPnPStep4 from "./R007GeneratorPnPStep4";
import R007GeneratorPnPStep5 from "./R007GeneratorPnPStep5";
import R007GeneratorPnPStep6 from "./R007GeneratorPnPStep6";

const R007Generator: React.FC = () => {
  // State management
  const [state, setState] = useState<GeneratorState>({
    currentStep: 1,
    commissionType: null,
    uploadedFile: null,
    sites: [],

    selectedSites: [],        // ← THÊM
  executionId: null,         // ← THÊM

      // siteGroups: [],
    generationProgress: null,
    jobResult: null,
    error: null,
    templates: [], // ← THÊM DÒNG NÀY
    generatedResults: [], // ← THÊM dòng này
    executionTimestamps: { // ← THÊM
    generateXML: { startTime: null, endTime: null },
    uploadOSS: { startTime: null, endTime: null },
    executeCommissioning: { startTime: null, endTime: null },
  },
  currentJobId: null, // ← THÊM
  currentExecutionId: null, // ← THÊM
});

  // THÊM STATE SEARCH ← THÊM DÒNG NÀY
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rawExcelData, setRawExcelData] = useState<any[][]>([]);
  // THÊM PAGINATION STATE ← THÊM 2 DÒNG NÀY
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // code
  
 



  // Navigation handlers
  const goToStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };
  //========================================================================

  const nextStep = () => {
    if (state.currentStep < 6) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };
  //========================================================================

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };
  //========================================================================

  // Step 1: Select Commission Type
  const handleCommissionTypeSelect = (type: CommissionType) => {
    setState((prev) => ({ ...prev, commissionType: type }));
  };
  //========================================================================


  
  

  
  

  // Step 2: Upload file

  // Step 2: Parse Excel with ExcelJS
  const handleFileUpload = async (file: File) => {
    setState((prev) => ({ ...prev, uploadedFile: file, error: null }));

    try {
      // Read file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      //========================================================================

      // Get first worksheet
      const worksheet = workbook.worksheets[0];
      //========================================================================

      // Get headers (row 1)
      const headerRow = worksheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString() || "";
      });
      //========================================================================

      // LƯU HEADERS VÀO STATE ← THÊM DÒNG NÀY
      setExcelHeaders(headers.filter((h) => h)); // Lọc bỏ empty
      //========================================================================

      // Helper to get column index by header name
      const getColIndex = (headerName: string): number => {
        return headers.findIndex((h) => h === headerName);
      };
      //========================================================================

      // LƯU HEADERS VÀO STATE
      setExcelHeaders(headers.filter((h) => h)); // Lọc bỏ empty
      // Parse data rows (from row 2)
      const sites: SiteData[] = [];
      const rawData: any[][] = []; // ← LƯU RAW DATA
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        // LƯU RAW ROW DATA
        const rowData: any[] = [];
        row.eachCell((cell, colNumber) => {
          rowData[colNumber] = cell.value;
        });
        rawData.push(rowData);

        // VẪN CẦN parse sites cho validation/selection
        const getCellValue = (colName: string): any => {
          const colIndex = getColIndex(colName);
          if (colIndex < 0) return null;
          return row.getCell(colIndex).value;
        };

        sites.push({
          id: `s${rowNumber - 1}`,
          selected: true,

          // Giữ nguyên các fields này cho logic khác (validation, selection)
          stt: getCellValue("STT") || rowNumber - 1,
          siteName: getCellValue("MRBTSName") || getCellValue(" MRBTS Name 5G") || "",
          address: getCellValue("Address") || "",
          ipOam: getCellValue("OAM") || "",
          vlanMsPlane: Number(getCellValue("VLAN ID M/S-Plane 5G")) || 0,
          ipMsPlane: getCellValue("IP Address M/S-Plane 5G") || "",
          gatewayMsPlane: getCellValue("Gateway IP Address M/S-Plane 5G") || "",
          vlanCuPlane: Number(getCellValue("VLAN ID C/U-PLANE 5G")) || 0,
          ipCuPlane: getCellValue("IP Address C/U-PLANE 5G") || "",
          gatewayCuPlane: getCellValue("Gateway IP Address C/U-PLANE 5G") || "",
          serialSm5g: getCellValue("Serial_SM_5G") || "",
          nrbtsId5g: Number(getCellValue("NRBTS_ID_5G")) || 0,
          mrbtsId: Number(getCellValue("MRBTS_ID")) || 0,
          mrbtsName5g: getCellValue("MRBTS_Name_5G") || getCellValue("MRBTSName") || "",
          band5g: getCellValue("5G_Band") || "",
          rrh5g: getCellValue("5G_RRH") || "",
          profile: getCellValue("Profile") || "",
          physCellId1: Number(getCellValue("PhysCellId_1")) || 0,
          physCellId2: Number(getCellValue("PhysCellId_2")) || 0,
          physCellId3: Number(getCellValue("PhysCellId_3")) || 0,
          beamset1: getCellValue("Beamset_1") || "",
          beamset2: getCellValue("Beamset_2") || "",
          beamset3: getCellValue("Beamset_3") || "",

          // ← THÊM 6 FIELDS MỚI Ở ĐÂY:
          province: getCellValue("Province") || "",
          district: getCellValue("Distric") || "", // ← Không có 't' cuối!
          fbbManager: getCellValue("FBB_Manager") || "",
          managementCell: getCellValue("5G_Management_Cell") || "",
          bandSm: getCellValue("SM") || "",
          channelBw: getCellValue("chBw(MHz)") || "",
          // Validation
          validationStatus: "valid",
          validationErrors: [],
          templateMatched: null,
        });
      });

      // console.log("✅ Parsed sites:", sites.length);
      setRawExcelData(rawData); // ← LƯU VÀO STATE
      //  setState((prev) => ({ ...prev, sites }));

      console.log("✅ Parsed sites:", sites.length);
      setState((prev) => ({ ...prev, sites }));
      //========================================================================
    } catch (error) {
      console.error("❌ Error parsing Excel:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to parse Excel file. Please check format.",
      }));
    }
    //========================================================================
  };

  
  


  /**
   * Clear all template selections
   */
  {
    /*
  const handleClearAllTemplates = () => {
    setState((prev) => ({
      ...prev,
      sites: prev.sites.map((site) => ({
        ...site,
        templateMatched: null,
      })),
    }));

    console.log("🗑️ Cleared all template selections");
  };

  */
  }



  // ============================================================================
  // Step 3: Update site selection
  const handleSiteSelectionChange = (siteId: string, selected: boolean) => {
    setState((prev) => ({
      ...prev,
      sites: prev.sites.map((site) => (site.id === siteId ? { ...site, selected } : site)),
    }));
  };
// ============================================================================

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <div
            className="r007-step-content"
            style={{
              height: "500px",
            }}
          >
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
              {/* Left: Icon + Title */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.3)",
                    fontSize: "28px",
                    marginLeft: "-20px",
                  }}
                >
                  ✓
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
                    Step 1: Select Commission Type
                  </h1>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    Choose your deployment method
                  </p>
                </div>
              </div>

              {/* Right: Selected Badge (if selected) */}
              {state.commissionType && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 20px",
                    background: "white",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: state.commissionType === "SiteConfig" ? "linear-gradient(135deg, #f97316, #ea580c)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: state.commissionType === "SiteConfig" ? "0 4px 12px rgba(249, 115, 22, 0.3)" : "0 4px 12px rgba(139, 92, 246, 0.3)",
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
                      Selected
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#333",
                      }}
                    >
                      {state.commissionType === "SiteConfig" ? "Site Configuration" : "Auto PnP"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* CONTENT */}
            <div className="r007-commission-types">
              {/* Cards giữ nguyên như cũ */}
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
                <div
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(249, 115, 22, 0.4)",
                    margin: "0 auto 20px auto",
                    fontSize: "48px",
                  }}
                >
                  🛠️
                </div>
                <h3>Site Configuration</h3>
                <p>Manual commissioning at site</p>
                <ul>
                  <li>Engineer goes to site</li>
                  <li>Full parameter control</li>
                  <li>Complex configuration</li>
                </ul>
              </div>

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
          <div
            className="r007-step-content-02"
            style={{
              height: "500px",
            }}
          >
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
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // margin: "0 auto 20px auto", // ← ĐỔI: từ marginBottom → margin (tự động căn giữa)
                    marginLeft: "-20px",
                    // boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
                    boxShadow: "0 6px 16px rgba(59, 130, 246, 0.3)", // ← ĐỔI: từ 8px → 6px
                  }}
                >
                  {React.createElement(FiUpload as any, { size: 28, color: "white", strokeWidth: 2.5 })}
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
                    Step 2: Upload Datafill Excel
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
                    Upload your datafill Excel file to parse site data
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

            {/* CONTENT */}
            {/*</div><div> */}

            {/* CONTENT */}
            <div
              style={{
                marginLeft: "-60px",
                marginRight: "-40px",
                paddingLeft: "40px",
                paddingRight: "20px",
              }}
            >
              {/* Download template link */}
              <p style={{ marginTop: "-15px", marginBottom: "30px", color: "#64748b" }}>
                💡 Need template?{" "}
                <a href="/templates/5G_Datafill_Template.xlsx" download style={{ color: "#1976d2", textDecoration: "underline", cursor: "pointer" }}>
                  Download
                </a>
              </p>
              {/* Upload Area */}
              {/* Upload Area */}
              <div
                className="r007-upload-area"
                style={{
                  height: "370px", // ← THÊM chiều cao cố định
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "-10px",
                  marginLeft: "20px",
                  marginRight: "20px",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    handleFileUpload(files[0]);
                  }
                }}
              >
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
                  <div
                    style={{
                      width: "200px",
                      height: "160px",
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // marginBottom: "20px",
                      transform: "translateY(10px)", // ← THÊM dòng này (kéo lên 10px)
                      margin: "0 auto 20px auto", // ← ĐỔI: từ marginBottom → margin (tự động căn giữa)

                      boxShadow: "0 8px 20px rgba(6, 182, 212, 0.3)",
                      fontSize: "40px",
                    }}
                  >
                    {React.createElement(FiUploadCloud as any, {
                      size: 96,
                      color: "white",
                      strokeWidth: 2,
                    })}
                  </div>

                  <p style={{ fontSize: "16px", fontWeight: "600", marginTop: "30px", color: "#333" }}>Drag and drop your Excel file here</p>
                  <p style={{ color: "#999" }}>or</p>
                  <button style={{ marginTop: "10px" }} className="r007-browse-btn">
                    Browse Files
                  </button>
                  <p style={{ marginBottom: "-5px" }} className="r007-upload-hint">
                    Supported: .xlsx, .xls (Max: 2GB)
                  </p>
                </label>
              </div>
              {/* File info */}
              {state.uploadedFile && (
                <div className="r007-file-info">
                  <p>✓ Uploaded: {state.uploadedFile.name}</p>
                  <p>Sites detected: {state.sites.length}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div
            className="r007-step-content"
            style={{
              height: "500px",
            }}
          >
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
                    // marginRight: "-40px",
                  }}
                >
                  👁️
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
                    Step 3: Preview & Select Sites
                  </h1>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    Review and validate site data from Excel file
                  </p>
                </div>
              </div>

              {/* Right: Stats Badge */}
            </div>

            {/* CONTENT */}
            <div
              style={{
                marginLeft: "-40px",
                marginRight: "-40px",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              {/* Toolbar: Search + Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  gap: "16px",
                  marginTop: "-15px",
                }}
              >
                {/* Left: Search */}
                <div style={{ flex: 1, maxWidth: "400px", position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search sites..."
                    value={searchTerm} // ← THÊM
                    onChange={(e) => setSearchTerm(e.target.value)} // ← THÊM
                    style={{
                      width: "100%",
                      padding: "10px 16px 10px 40px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#1976d2";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(25, 118, 210, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "18px",
                      color: "#999",
                    }}
                  >
                    🔍
                  </span>
                </div>

                {/* Right: Action Buttons */}
                {/* Info Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    // marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", gap: "24px" }}>
                    <div>
                      <span style={{ fontSize: "13px", color: "#999", fontWeight: "500" }}>Total Sites: </span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#1976d2" }}>{state.sites.length}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", color: "#999", fontWeight: "500" }}>Selected: </span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#059669" }}>{state.sites.filter((s) => s.selected).length}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", color: "#999", fontWeight: "500" }}>Invalid: </span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#d32f2f" }}>{state.sites.filter((s) => s.validationStatus === "invalid").length}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", color: "#999", fontWeight: "500" }}>Parameters: </span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#f97316" }}>{excelHeaders.length}</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
              </div>
              {/* Info Bar */}
              {/* Table */}
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    {/*}
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <tr style={{ background: "linear-gradient(135deg, #f5f5f5, #eeeeee)" }}>
*/}
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <tr style={{ background: "linear-gradient(135deg, #f97316)" }}>
                        {/* Checkbox column */}
                        <th
                          style={{
                            padding: "14px 12px",
                            textAlign: "center",
                            fontWeight: "700",
                            color: "white",
                            borderBottom: "3px solid #1976d2",
                            borderRight: "1px solid #c7d2fe",
                            width: "50px",
                            position: "sticky",
                            left: 0,
                            background: "#f97316",
                            zIndex: 11,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={state.sites.length > 0 && state.sites.every((s) => s.selected)}
                            onChange={(e) => {
                              const allSelected = e.target.checked;
                              setState((prev) => ({
                                ...prev,
                                sites: prev.sites.map((site) => ({ ...site, selected: allSelected })),
                              }));
                            }}
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                        </th>

                        {/* Dynamic headers from Excel */}
                        {excelHeaders.map((header, index) => (
                          <th
                            key={index}
                            title={header} // ← THÊM
                            style={{
                              padding: "14px 12px",
                              textAlign: "left",
                              fontWeight: "700",
                              color: "#333",
                              borderBottom: "2px solid #1976d2",
                              borderRight: "1px solid #e0e0e0", // ← THÊM
                              minWidth: "40px",
                              maxWidth: "200px", // ← THÊM
                              whiteSpace: "nowrap",
                              overflow: "hidden", // ← THÊM
                              textOverflow: "ellipsis", // ← THÊM
                            }}
                          >
                            {header}
                          </th>
                        ))}

                        {/* Status column */}
                        <th
                          style={{
                            padding: "14px 12px",
                            textAlign: "center",
                            fontWeight: "700",
                            color: "#333",
                            borderBottom: "2px solid #1976d2",
                            minWidth: "100px",
                          }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {(() => {
                        // Filter sites
                        const filteredSites = state.sites.filter((site) => {
                          if (!searchTerm) return true;
                          const search = searchTerm.toLowerCase();
                          return site.siteName?.toLowerCase().includes(search) || site.address?.toLowerCase().includes(search) || site.ipOam?.toLowerCase().includes(search) || site.serialSm5g?.toLowerCase().includes(search) || site.nrbtsId5g?.toString().toLowerCase().includes(search);
                        });
                        // Pagination
                        const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedSites = filteredSites.slice(startIndex, endIndex);

                        return paginatedSites
                          .slice(0, 5) // ← CHỈ LẤY 5 BẢN GHI
                          .map((site, displayIndex) => {
                            const rowIndex = state.sites.findIndex((s) => s.id === site.id);
                            const rawRow = rawExcelData[rowIndex] || [];

                            // .slice(0, 5) // ← CHỈ LẤY 5 BẢN GHI
                            // .map((site, displayIndex) => {
                            // Tìm rowIndex gốc trong state.sites
                            // const rowIndex = state.sites.findIndex((s) => s.id === site.id);
                            // const rawRow = rawExcelData[rowIndex] || [];

                            return (
                              <tr
                                key={site.id}
                                style={{
                                  background: rowIndex % 2 === 0 ? "white" : "#fafafa",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#e3f2fd";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = rowIndex % 2 === 0 ? "white" : "#fafafa";
                                }}
                              >
                                {/* Checkbox */}
                                <td
                                  style={{
                                    padding: "10px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #e0e0e0",
                                    borderRight: "1px solid #e0e0e0",
                                    position: "sticky",
                                    left: 0,
                                    background: rowIndex % 2 === 0 ? "white" : "#fafafa",
                                    zIndex: 9,
                                    // height: "20px",
                                  }}
                                >
                                  <input type="checkbox" checked={site.selected} onChange={(e) => handleSiteSelectionChange(site.id, e.target.checked)} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                                </td>

                                {/* Dynamic cells - ĐỌC TRỰC TIẾP TỪ RAW DATA */}
                                {excelHeaders.map((header, colIndex) => {
                                  const value = rawRow[colIndex + 1]?.toString() || "";
                                  const isIP = header.includes("IP") || header.includes("OAM");
                                  const isVLAN = header.includes("VLAN");
                                  const isBand = header.includes("Band");
                                  const isRRH = header.includes("RRH");

                                  return (
                                    <td
                                      key={colIndex}
                                      title={value}
                                      style={{
                                        padding: "10px",
                                        borderBottom: "1px solid #e0e0e0",
                                        borderRight: "1px solid #e0e0e0",
                                        fontFamily: isIP ? "monospace" : "inherit",
                                        fontWeight: isVLAN ? "600" : "normal",
                                        textAlign: isVLAN ? "center" : "left",
                                        maxWidth: "200px", // ← MAX WIDTH
                                        minWidth: "20px", // ← MIN WIDTH
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        height: "20px",
                                      }}
                                    >
                                      {isBand ? (
                                        <span
                                          title={value}
                                          style={{
                                            padding: "4px 10px",
                                            background: "#e3f2fd",
                                            color: "#1976d2",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            display: "inline-block",
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          {value}
                                        </span>
                                      ) : isRRH ? (
                                        <span
                                          title={value}
                                          style={{
                                            padding: "4px 10px",
                                            background: "#fff3e0",
                                            color: "#f97316",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            display: "inline-block",
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          {value}
                                        </span>
                                      ) : (
                                        value || ""
                                      )}
                                    </td>
                                  );
                                })}

                                {/* Status */}
                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #e0e0e0",
                                  }}
                                >
                                  <span
                                    title={site.validationStatus}
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: "12px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      background: site.validationStatus === "valid" ? "#e8f5e9" : site.validationStatus === "invalid" ? "#ffebee" : "#fff3e0",
                                      color: site.validationStatus === "valid" ? "#2e7d32" : site.validationStatus === "invalid" ? "#c62828" : "#e65100",
                                      display: "inline-block",
                                    }}
                                  >
                                    {site.validationStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* ======================================================================== */}
              {/* PAGINATION - 1 DÒNG COMPACT */}
              {(() => {
                const filteredSites = state.sites.filter((site) => {
                  if (!searchTerm) return true;
                  const search = searchTerm.toLowerCase();
                  return site.siteName?.toLowerCase().includes(search) || site.address?.toLowerCase().includes(search) || site.ipOam?.toLowerCase().includes(search) || site.band5g?.toString().toLowerCase().includes(search) || site.rrh5g?.toString().toLowerCase().includes(search);
                });

                const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage + 1;
                const endIndex = Math.min(currentPage * itemsPerPage, filteredSites.length);

                const renderPageNumbers = () => {
                  const pages = [];

                  if (totalPages <= 7) {
                    // Hiện tất cả
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Logic thông minh
                    pages.push(1);

                    if (currentPage > 3) pages.push("...");

                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i);
                      }
                    }

                    if (currentPage < totalPages - 2) pages.push("...");

                    pages.push(totalPages);
                  }

                  return pages;
                };

                return (
                  <div
                    style={{
                      marginTop: "5px",
                      padding: "11px 0px",
                      background: "#f9f9f9",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Left: Info */}
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      Showing{" "}
                      <strong>
                        {startIndex}-{endIndex}
                      </strong>{" "}
                      of <strong>{filteredSites.length}</strong> sites
                    </div>

                    {/* Center: Pagination */}
                    {totalPages > 1 && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {/* Previous */}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          style={{
                            padding: "6px 12px",
                            background: currentPage === 1 ? "#f0f0f0" : "white",
                            color: currentPage === 1 ? "#ccc" : "#1976d2",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== 1) {
                              e.currentTarget.style.background = "#e3f2fd";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== 1) {
                              e.currentTarget.style.background = "white";
                            }
                          }}
                        >
                          ◄
                        </button>

                        {/* Page Numbers */}
                        {renderPageNumbers().map((page, idx) => {
                          if (page === "...") {
                            return (
                              <span key={`ellipsis-${idx}`} style={{ color: "#999", padding: "0 4px" }}>
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page as number)}
                              style={{
                                width: "32px",
                                height: "32px",
                                padding: "0",
                                background: currentPage === page ? "linear-gradient(135deg, #1976d2, #1565c0)" : "white",
                                color: currentPage === page ? "white" : "#666",
                                border: currentPage === page ? "none" : "1px solid #e0e0e0",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                boxShadow: currentPage === page ? "0 2px 8px rgba(25, 118, 210, 0.3)" : "none",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                if (currentPage !== page) {
                                  e.currentTarget.style.background = "#e3f2fd";
                                  e.currentTarget.style.color = "#1976d2";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (currentPage !== page) {
                                  e.currentTarget.style.background = "white";
                                  e.currentTarget.style.color = "#666";
                                }
                              }}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next */}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          style={{
                            padding: "6px 12px",
                            background: currentPage === totalPages ? "#f0f0f0" : "white",
                            color: currentPage === totalPages ? "#ccc" : "#1976d2",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== totalPages) {
                              e.currentTarget.style.background = "#e3f2fd";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== totalPages) {
                              e.currentTarget.style.background = "white";
                            }
                          }}
                        >
                          ►
                        </button>
                      </div>
                    )}

                    {/* Right: Filter */}
                    {searchTerm && <div style={{ fontSize: "12px", color: "#1976d2", fontWeight: "600" }}>🔍 "{searchTerm}"</div>}
                  </div>
                );
              })()}
              {/* KẾT THÚC PAGINATION CONTROLS */}
              {/* ======================================================================== */}
              {/*}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Showing:{" "}
                  <strong>
                    {
                      state.sites.filter((site) => {
                        if (!searchTerm) return true;
                        const search = searchTerm.toLowerCase();

                        return site.siteName?.toLowerCase().includes(search) || site.address?.toLowerCase().includes(search) || site.ipOam?.toLowerCase().includes(search) || site.serialSm5g?.toLowerCase().includes(search) || site.nrbtsId5g?.toString().toLowerCase().includes(search);
                      }).length
                    }
                  </strong>{" "}
                  of <strong>{state.sites.length}</strong> sites
                </div>

                {searchTerm && <div style={{ fontSize: "13px", color: "#1976d2", fontWeight: "600" }}>🔍 Filtering by: "{searchTerm}"</div>}

                {/* <div style={{ fontSize: "13px", color: "#999" }}>Scroll table to view all {state.sites.length} records</div> */}
            </div>
          </div>
        );

      case 4:

      return (
    <R007GeneratorPnPStep4
      state={state}
      setState={setState}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      itemsPerPage={itemsPerPage}
    />
  );
        

      case 5:
        return (
          
          <R007GeneratorPnPStep5
      state={state}
      setState={setState}
      goToStep={goToStep}
    />
        );

      case 6:
        return (
    <R007GeneratorPnPStep6
      state={state}
      setState={setState}
      goToStep={goToStep}
    />
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
          <button className="r007-nav-btn r007-btn-primary" onClick={nextStep} disabled={(state.currentStep === 1 && !state.commissionType) || (state.currentStep === 2 && !state.uploadedFile)

            || (state.currentStep === 5 && state.generationProgress?.percentage !== 100) // ← THÊM điều kiện này


            
          }>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};

export default R007Generator;
