import React, { useState } from "react";
import Anm4_uc1 from "./UC1";
import Anm4_uc2 from "./UC2";
// import Anm_uc4 from "./UC4";
// import Anm_uc5 from "./UC5";

const AnmTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("uc1");

  // ✅ Shared filters between UC1 and UC2
  const [filters, setFilters] = useState<{
    os?: string;
    status?: string;
  }>({});

  // ✅ Tab switcher
  const goToTab = (tabKey: string) => {
    console.log("➡️ Switching to tab:", tabKey);
    setActiveTab(tabKey);
  };

  return (
    <div className="p-3">
      {/* --- Tab Headers --- */}
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

      {/* --- Tab Content --- */}
      <div className="mt-3">
        {activeTab === "uc1" && (
          <Anm4_uc1 goToTab={goToTab} setFilters={setFilters} />
        )}

        {activeTab === "uc2" && (
          <Anm4_uc2 goToTab={goToTab} setFilters={setFilters} filters={filters} />
        )}

        {/* {activeTab === "uc3" && <Anm_uc3 goToTab={goToTab} />} */}
        {/* {activeTab === "uc4" && <Anm_uc4 goToTab={goToTab} />} */}
        {/* {activeTab === "uc5" && <Anm_uc5 goToTab={goToTab} />} */}
      </div>
    </div>
  );
};

export default AnmTabs;
