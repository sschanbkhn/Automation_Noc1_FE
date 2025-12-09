import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ArchiveFilters, DropdownOptions } from "./ConfigTypes";
import API_CONFIG from "../Designer/ApiR0075GSRANPnPDeclarationConfig";

interface ArchiveModalProps {
  show: boolean;
  onClose: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ show, onClose }) => {
  const [archiveData, setArchiveData] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveFilters, setArchiveFilters] = useState<ArchiveFilters>({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    province: "",
    district: "",
    vendor: "",
  });
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    provinces: [],
    districts: [],
    vendors: [],
  });

  // Load dropdown options
  const loadDropdownOptions = async () => {
    try {
      const [provincesRes, districtsRes, vendorsRes] = await Promise.all([fetch(`${API_CONFIG.BASE_URL}/configuration/get-archive-provinces`), fetch(`${API_CONFIG.BASE_URL}/configuration/get-archive-districts`), fetch(`${API_CONFIG.BASE_URL}/configuration/get-archive-vendors`)]);

      const [provincesData, districtsData, vendorsData] = await Promise.all([provincesRes.json(), districtsRes.json(), vendorsRes.json()]);

      setDropdownOptions({
        provinces: provincesData || [],
        districts: districtsData || [],
        vendors: vendorsData || [],
      });
    } catch (error) {
      console.error("Error loading dropdown options:", error);
      setDropdownOptions({
        provinces: [],
        districts: [],
        vendors: [],
      });
    }
  };

  // Load archive data
  const loadArchiveData = async () => {
    setArchiveLoading(true);
    try {
      const params = new URLSearchParams();
      if (archiveFilters.startDate) params.append("startDate", archiveFilters.startDate);
      if (archiveFilters.endDate) params.append("endDate", archiveFilters.endDate);
      if (archiveFilters.province) params.append("province", archiveFilters.province);
      if (archiveFilters.district) params.append("district", archiveFilters.district);
      if (archiveFilters.vendor) params.append("vendor", archiveFilters.vendor);

      const response = await fetch(`${API_CONFIG.BASE_URL}/configuration/archive-reports?page=1&pageSize=50&${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;
      setArchiveData(data);

      console.log("Archive data loaded:", data);
    } catch (error) {
      console.error("Error loading archive data:", error);
      setArchiveData([]);
    } finally {
      setArchiveLoading(false);
    }
  };

  // Load options when modal opens
  useEffect(() => {
    if (show) {
      loadDropdownOptions();
      loadArchiveData();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "95vw",
          maxWidth: "1400px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#8e44ad",
            color: "white",
            padding: "20px 24px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Detail Archive Reports</h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "8px",
              padding: "8px",
              color: "white",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              From Date:
            </label>
            <input
              type="date"
              value={archiveFilters.startDate}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              To Date:
            </label>
            <input
              type="date"
              value={archiveFilters.endDate}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              Province:
            </label>
            <select
              value={archiveFilters.province}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  province: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value="">All Provinces ({dropdownOptions.provinces.length})</option>
              {dropdownOptions.provinces.map((province: string) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              District:
            </label>
            <select
              value={archiveFilters.district}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  district: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value="">All Districts ({dropdownOptions.districts.length})</option>
              {dropdownOptions.districts.map((district: string) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              Vendor:
            </label>
            <select
              value={archiveFilters.vendor}
              onChange={(e) =>
                setArchiveFilters((prev) => ({
                  ...prev,
                  vendor: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value="">All Vendors ({dropdownOptions.vendors.length})</option>
              {dropdownOptions.vendors.map((vendor: string) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadArchiveData}
            disabled={archiveLoading}
            style={{
              background: "#8e44ad",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              cursor: archiveLoading ? "not-allowed" : "pointer",
              opacity: archiveLoading ? 0.7 : 1,
            }}
          >
            {archiveLoading ? "Loading..." : "Display"}
          </button>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, padding: "16px 24px", overflow: "auto" }}>
          {archiveLoading ? (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "40px",
              }}
            >
              Loading archive data...
            </div>
          ) : archiveData.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#8e44ad15",
                    borderBottom: "2px solid #8e44ad",
                  }}
                >
                  {Object.keys(archiveData[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#8e44ad",
                      }}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {archiveData.map((item: any, index: number) => (
                  <tr key={index}>
                    {Object.values(item).map((value: any, i: number) => (
                      <td key={i} style={{ padding: "12px" }}>
                        {String(value || "N/A")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "40px",
              }}
            >
              No archive data found for the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
