
// R007GeneratorStep4.tsx
// import React from "react";
// ✅ MỚI:
import React, { useEffect } from "react";
import { GeneratorState, SiteData, TemplateFile } from "./R007generatorTypes";

interface Step4Props {
  state: GeneratorState;
  setState: React.Dispatch<React.SetStateAction<GeneratorState>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
}



const R007GeneratorPnPStep4: React.FC<Step4Props> = ({
  state,
  setState,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}) => {

// ============================================================================
  // AUTO TEMPLATE MATCHING - THÊM VÀO R007Generator.tsx
  // ============================================================================

  /*
  
    // Load templates khi vào Step 4
    useEffect(() => {
      if (state.currentStep === 4 && state.templates.length === 0) {
        loadTemplates();
      }
    }, [state.currentStep]);
    //========================================================================

*/

      // ← THÊM useEffect MỚI Ở ĐÂY:
  // Auto-match templates sau khi load xong
  useEffect(() => {
    if (state.currentStep === 4 && state.templates.length > 0 && state.sites.length > 0) {
      // Chỉ auto-match nếu chưa có site nào được match
      const hasMatched = state.sites.some(s => s.templateMatched);
      if (!hasMatched) {
        console.log("🔄 Auto-matching templates on load...");
        handleAutoMatchAll();
      }
    }
  }, [state.currentStep, state.templates.length, state.sites.length]);

  
  /**
   * Auto match template for a single site
   */
  // ============================================================================

  const autoMatchTemplate = (site: SiteData, templates: TemplateFile[]): string | null => {
    if (!templates || templates.length === 0) return null;

    const normalized = normalizeSiteData(site);

    // Find template that contains ALL matching parts
    for (const template of templates) {
      const fileName = template.fileName.toUpperCase();

      // Check if ALL parts exist in filename
      const hasAllParts = (!normalized.mgmtCell || fileName.includes(normalized.mgmtCell)) && (!normalized.band || fileName.includes(normalized.band)) && (!normalized.sm || fileName.includes(normalized.sm)) && (!normalized.fbb || fileName.includes(normalized.fbb)) && (!normalized.rrh || fileName.includes(normalized.rrh));

      if (hasAllParts) {
        console.log(`✅ Matched site ${site.siteName} → ${template.fileName}`);
        return template.id;
      }
    }

    console.log(`⚠️ No match found for site ${site.siteName}`, normalized);
    return null;
  };
// ============================================================================


  /**
   * Normalize site data for template matching
   */
// ============================================================================

  const normalizeSiteData = (site: SiteData) => {
    // managementCell: "1*1*1" → "111", "2*2*2" → "222"
    const mgmtCell = site.managementCell?.replace(/\*/g, "") || "";
// ============================================================================

    // band5g: "n77" → "N77", "78" → "N78"
    let band = site.band5g?.toUpperCase() || "";
    if (band && !band.startsWith("N")) {
      band = "N" + band;
    }
// ============================================================================

    // bandSm: "asim" → "ASIM"
    const sm = site.bandSm?.toUpperCase() || "";
// ============================================================================

    // fbbManager: "abip" → "ABIP"
    const fbb = site.fbbManager?.toUpperCase() || "";
// ============================================================================

    // rrh5g: "avqg" → "AVQG"
    const rrh = site.rrh5g?.toUpperCase() || "";
// ============================================================================

    return { mgmtCell, band, sm, fbb, rrh };
  };
// ============================================================================





  /**
   * Handle manual template selection for a site
   */
  // ============================================================================

  const handleTemplateChange = (siteId: string, templateId: string) => {
    setState((prev) => ({
      ...prev,
      sites: prev.sites.map((site) => (site.id === siteId ? { ...site, templateMatched: templateId || null } : site)),
    }));
  };
// ============================================================================




  /**
   * Auto match all selected sites
   */
  const handleAutoMatchAll = () => {
    if (state.templates.length === 0) {
      setState((prev) => ({
        ...prev,
        error: "No templates loaded. Please wait for templates to load.",
      }));
      return;
    }

    console.log("🔄 Starting auto-match for all sites...");

    let matchedCount = 0;
    let unmatchedCount = 0;

    setState((prev) => ({
      ...prev,
      sites: prev.sites.map((site) => {
        if (!site.selected) return site; // Skip unselected sites

        const matchedTemplateId = autoMatchTemplate(site, state.templates);

        if (matchedTemplateId) {
          matchedCount++;
        } else {
          unmatchedCount++;
        }

        return {
          ...site,
          templateMatched: matchedTemplateId as string | null,
        };
      }),
    }));

    console.log(`✅ Auto-match complete: ${matchedCount} matched, ${unmatchedCount} unmatched`);
  };




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
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(249, 115, 22, 0.3)",
                    fontSize: "28px",
                    marginLeft: "-20px",
                  }}
                >
                  📋
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
                    Step 4: Template Configuration
                  </h1>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    Select configuration template for each site
                  </p>
                </div>
              </div>

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

            {/* CONTENT */}
            <div
              style={{
                marginLeft: "-40px",
                marginRight: "-40px",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              {/* Toolbar */}
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
                      e.currentTarget.style.borderColor = "#f97316";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
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

                {/* Stats Bar */}
                {/* //======================================================================== */}

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
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#1976d2" }}>{state.sites.filter((s) => s.selected).length}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", color: "#999", fontWeight: "500" }}>Matched: </span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#059669" }}>{state.sites.filter((s) => s.selected && s.templateMatched).length}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "13px", color: "#999", fontWeight: "500" }}>Unmatched: </span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#d32f2f" }}>{state.sites.filter((s) => s.selected && !s.templateMatched).length}</span>
                    </div>
                  </div>
                </div>
              </div>

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
                  className="r007-case4-table"  // ← THÊM CLASS
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <tr style={{ background: "linear-gradient(135deg, #1e40af, #1e3a8a)" }}>
                        {/* Checkbox */}
                        <th
                          style={{
                            padding: "14px 12px",
                            textAlign: "center",
                            fontWeight: "700",
                            color: "white",
                            borderBottom: "3px solid #f97316",
                            borderRight: "1px solid rgba(255,255,255,0.1)",
                            width: "50px",
                            position: "sticky",
                            left: 0,
                            background: "#1e40af",
                            zIndex: 11,
                          }}
                        >
                          <input type="checkbox" style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                        </th>

                        {/* Columns with proper sizing */}
                        {[
                          { label: "STT", width: "60px" },
                          { label: "MRBTS Name", width: "150px" },
                          { label: "Address", width: "180px" },
                          { label: "IP OAM", width: "120px" },
                          { label: "Province", width: "100px" },
                          { label: "District", width: "100px" },
                          { label: "Serial SM 5G", width: "140px" },
                          { label: "NRBTS ID 5G", width: "100px" },
                          { label: "MRBTS ID", width: "90px" },
                          { label: "MRBTS Name 5G", width: "150px" },
                          { label: "Profile", width: "120px" },
                          { label: "FBB Manager", width: "120px" },
                          { label: "5G Mgmt Cell", width: "120px" },
                          { label: "5G Band SM", width: "100px" },
                          { label: "5G Band", width: "90px" },
                          { label: "5G RRH", width: "100px" },
                          { label: "BW (MHz)", width: "90px" },
                          { label: "Template File", width: "250px" },
                          { label: "Details", width: "100px" },
                        ].map((col, idx) => (
                          <th
                            key={idx}
                            title={col.label}
                            style={{
                              padding: "14px 12px",
                              textAlign: "left",
                              fontWeight: "700",
                              color: "white",
                              borderBottom: "3px solid #f97316",
                              borderRight: "1px solid rgba(255,255,255,0.1)",
                              minWidth: col.width,
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {(() => {
                        // Filter sites
                        const filteredSites = state.sites.filter((site) => {
                          if (!site.selected) return false;
                          if (!searchTerm) return true;

                          const search = searchTerm.toLowerCase();
                          return site.siteName?.toLowerCase().includes(search) || site.address?.toLowerCase().includes(search) || site.ipOam?.toLowerCase().includes(search) || site.band5g?.toLowerCase().includes(search) || site.rrh5g?.toLowerCase().includes(search) || site.province?.toLowerCase().includes(search) || site.district?.toLowerCase().includes(search);
                        });

                        // Pagination
                        const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedSites = filteredSites.slice(startIndex, endIndex);

                        return paginatedSites.map((site, displayIndex) => {
                          const idx = startIndex + displayIndex; // Tính index thực cho alternating row color

                          return (
                            <tr
                              key={site.id}
                              style={{
                                background: idx % 2 === 0 ? "white" : "#f8fafc", // ← Dùng idx thay vì displayIndex
                                transition: "all 0.2s",
                                height: "50px"
                                
                                
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#dbeafe";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#f8fafc"; // ← idx
                              }}
                            >
                              {/* Checkbox */}
                              <td
                                style={{
                                  padding: "6px 10px",
                                  textAlign: "center",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "2px solid #c7d2fe",
                                  position: "sticky",
                                  left: 0,
                                  background: idx % 2 === 0 ? "white" : "#f8fafc",
                                  zIndex: 9,
                  
                                }}
                              >
                                <input type="checkbox" checked={site.selected} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                              </td>

                              {/* STT */}
                              <td
                                title={site.stt?.toString()}
                                style={{
                                  padding: "6px 10px",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
               
                                }}
                              >
                                {site.stt}
                              </td>

                              {/* MRBTS Name */}
                              <td
                                title={site.siteName}
                                style={{
                                  padding: "6px 10px",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  fontWeight: "600",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
               
                                }}
                              >
                                {site.siteName}
                              </td>

                              {/* Address */}
                              <td
                                title={site.address}
                                style={{
                                 padding: "6px 10px",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                    
                                }}
                              >
                                {site.address}
                              </td>

                              {/* IP OAM */}
                              <td
                                title={site.ipOam}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  fontFamily: "monospace",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                 
                                }}
                              >
                                {site.ipOam}
                              </td>

                              {/* Province */}
                              <td
                                title={site.province}
                                style={{
                                 
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
               
                                }}
                              >
                                {site.province || ""}
                              </td>

                              {/* District */}
                              <td
                                title={site.district}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                   
                                }}
                              >
                                {site.district || ""}
                              </td>

                              {/* Serial SM 5G */}
                              <td
                                title={site.serialSm5g}
                                style={{
                                  
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  //fontFamily: "monospace",
                                  // fontSize: "12px",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                   
                                  
                
                                }}
                              >
                                {site.serialSm5g}
                              </td>

                              {/* NRBTS ID 5G */}
                              <td
                                title={site.nrbtsId5g?.toString()}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  textAlign: "center",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                 
                                }}
                              >
                                {site.nrbtsId5g}
                              </td>

                              {/* MRBTS ID */}
                              <td
                                title={site.mrbtsId?.toString()}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                      
                                }}
                              >
                                {site.mrbtsId}
                              </td>

                              {/* MRBTS Name 5G */}
                              <td
                                title={site.mrbtsName5g}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                
                                }}
                              >
                                {site.mrbtsName5g}
                              </td>

                              {/* Profile */}
                              <td
                                title={site.profile}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                      
                                }}
                              >
                                {site.profile}
                              </td>

                              {/* FBB Manager */}
                              <td
                                title={site.fbbManager}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                      
                                }}
                              >
                                {site.fbbManager || ""}
                              </td>

                              {/* 5G Mgmt Cell */}
                              <td
                                title={site.managementCell}
                                style={{
                                 
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                     
                                }}
                              >
                                {site.managementCell || ""}
                              </td>

                              {/* 5G Band SM */}
                              <td
                                title={site.bandSm}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                   
                                }}
                              >
                                {site.bandSm && (
                                  <span
                                    title={site.bandSm}
                                    style={{
                                      
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
                                    {site.bandSm}
                                  </span>
                                )}
                              </td>

                              {/* 5G Band */}
                              <td
                                title={site.band5g}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",

                                }}
                              >
                                <span
                                  title={site.band5g}
                                  style={{
                                    
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
                                  {site.band5g}
                                </span>
                              </td>

                              {/* 5G RRH */}
                              <td
                                title={site.rrh5g}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",

                                }}
                              >
                                <span
                                  title={site.rrh5g}
                                  style={{
                                    
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
                                  {site.rrh5g}
                                </span>
                              </td>

                              {/* BW (MHz) */}
                              <td
                                title={site.channelBw?.toString()}
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                            
                                }}
                              >
                                {site.channelBw || ""}
                              </td>

                              {/* Template File - Dropdown */}
                              <td
                                style={{
                                  padding: "6px 10px",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  maxWidth: "200px",
                            
                                }}
                              >
                                <select
                                  title="Select template"
                                  value={site.templateMatched || ""} // ← THÊM value
                                  onChange={(e) => handleTemplateChange(site.id, e.target.value)} // ← THÊM onChange
                                  style={{
                                    width: "100%",
                                    padding: "6px 10px",
                                    border: site.templateMatched
                                      ? "2px solid #059669" // ← Green khi đã match
                                      : "2px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    background: site.templateMatched ? "#f0fdf4" : "white", // ← Light green bg
                                    cursor: "pointer",
                                    transition: "all 0.2s",

                                  }}
                                >
                                  <option value="">-- Select Template --</option>
                                  {state.templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                      {template.fileName}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Details Button */}
                              <td
                                style={{
                                  
                                  borderBottom: "1px solid #e2e8f0",
                                  textAlign: "center",
                        
                                }}
                              >
                                <button
                                  title="View site details"
                                  style={{
                                    padding: "6px 10px",
                                    background: "white",
                                    color: "#1976d2",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#1976d2";
                                    e.currentTarget.style.background = "#e3f2fd";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#e0e0e0";
                                    e.currentTarget.style.background = "white";
                                  }}
                                >
                                  🔍 View
                                </button>
                              </td>
                            </tr>
                          ); // ← Đóng return + đóng arrow function của map
                        }); // ← Đóng .map()
                      })()}

                      {/* // ← Đóng IIFE */}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* PAGINATION CONTROLS - THÊM Ở ĐÂY */}
              {(() => {
                const filteredSites = state.sites.filter((site) => {
                  if (!site.selected) return false;
                  if (!searchTerm) return true;

                  const search = searchTerm.toLowerCase();
                  return site.siteName?.toLowerCase().includes(search) || site.address?.toLowerCase().includes(search) || site.ipOam?.toLowerCase().includes(search) || site.band5g?.toLowerCase().includes(search) || site.rrh5g?.toLowerCase().includes(search) || site.province?.toLowerCase().includes(search) || site.district?.toLowerCase().includes(search);
                });

                const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage + 1;
                const endIndex = Math.min(currentPage * itemsPerPage, filteredSites.length);

                const renderPageNumbers = () => {
                  const pages = [];

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
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
                            color: currentPage === 1 ? "#ccc" : "#f97316",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
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
                                background: currentPage === page ? "linear-gradient(135deg, #f97316, #ea580c)" : "white",
                                color: currentPage === page ? "white" : "#666",
                                border: currentPage === page ? "none" : "1px solid #e0e0e0",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                boxShadow: currentPage === page ? "0 2px 8px rgba(249, 115, 22, 0.3)" : "none",
                                transition: "all 0.2s",
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
                            color: currentPage === totalPages ? "#ccc" : "#f97316",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          ►
                        </button>
                      </div>
                    )}

                    {/* Right: Filter */}
                    {searchTerm && <div style={{ fontSize: "12px", color: "#f97316", fontWeight: "600" }}>🔍 "{searchTerm}"</div>}
                  </div>
                );
              })()}
            </div>
          </div>
  );
};

    export default R007GeneratorPnPStep4;