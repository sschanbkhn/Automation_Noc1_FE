import React, { useState } from "react";
import Anm3_uc1 from "./UC1";
import IndexPage from "./UC2";
// import Anm_uc3 from "./UC3";
// import Anm_uc4 from "./UC4";
// import Anm_uc5 from "./UC5";

const AnmTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("uc1");

  // lifted filter state (shared between UC1 -> UC2)
  const [filters, setFilters] = useState<{
    status?: string;
  }>({});


  
  // switch tab
  const goToTab = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  return (
    <div className="p-3">
      {/* Tab headers */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "uc1" ? "active" : ""}`}
            onClick={() => goToTab("uc1")}
          >
            Kết quả tổng thể
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "uc2" ? "active" : ""}`}
            onClick={() => goToTab("uc2")}
          >
            Kết quả chi tiết
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "uc3" ? "active" : ""}`}
            onClick={() => goToTab("uc3")}
          >
            Lịch sử thực thi
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "uc4" ? "active" : ""}`}
            onClick={() => goToTab("uc4")}
          >
            Audit đột xuất
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "uc5" ? "active" : ""}`}
            onClick={() => goToTab("uc5")}
          >
            Audit theo đơn vị (Khu vực)
          </button>
        </li>
      </ul>

      {/* Tab content */}
      <div className="mt-3">
        {activeTab === "uc1" && (
          <Anm3_uc1 goToTab={goToTab} setFilters={setFilters}/>
        )}
        {activeTab === "uc2" && (
          <IndexPage goToTab={goToTab} filters={filters} />
        )}
        {/* {activeTab === "uc3" && <Anm_uc3 goToTab={goToTab} />} */}
        {/* {activeTab === "uc4" && <Anm_uc4 goToTab={goToTab} />} */}
        {/* {activeTab === "uc5" && <Anm_uc5 goToTab={goToTab} />} */}
      </div>
    </div>
  );
};

export default AnmTabs;
