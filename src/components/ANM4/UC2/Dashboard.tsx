import React, { useMemo, useState, useEffect } from "react";
import MyPieChart from "./MyPieChart";

interface DeviceItem {
  ip: string;
  os_name: string;
  os_version?: string;
  total_fail?: number;
  hostname: string;
}

interface ViolationItem {
  rule_id: string;
  criteria_name: string;
  hostname: string;
  solution?: string;
  actual_result?: string;
}

interface Props {
  devices: DeviceItem[];
  violations: ViolationItem[];
  filters?: { os?: string; status?: string }; // receives OS filter from UC1
}

// Normalize OS names from raw strings
function normalizeOS(name?: string): "Windows" | "Linux" {
  const n = (name || "").toLowerCase();
  if (n.includes("windows")) return "Windows";
  return "Linux"; // treat everything else as Linux (Ubuntu/CentOS/etc.)
}

const DashboardOsDetail: React.FC<Props> = ({ devices, violations, filters }) => {
  const [selectedOS, setSelectedOS] = useState<string>("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Keep local dropdown in sync with incoming OS filter
  useEffect(() => {
    if (filters?.os && filters.os !== "Tất cả") {
      setSelectedOS(filters.os);
    }
  }, [filters?.os]);

  // One authoritative OS filter: parent > local
  const effectiveOS =
    (filters?.os && filters.os !== "Tất cả" ? filters.os : selectedOS) || "Tất cả";

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const os = normalizeOS(d.os_name);

      const matchOS = effectiveOS === "Tất cả" || os === effectiveOS;

      const hasFail = (d.total_fail ?? 0) > 0;
      if (selectedStatus === "Fail") return matchOS && hasFail;
      if (selectedStatus === "Pass") return matchOS && !hasFail;
      return matchOS;
    });
  }, [devices, effectiveOS, selectedStatus]);

  // Pie chart: Pass vs Fail
  const summaryPie = useMemo(() => {
    const failCount = filteredDevices.filter((d) => (d.total_fail ?? 0) > 0).length;
    const passCount = filteredDevices.length - failCount;
    return [
      { label: "Fail", value: failCount, color: "#F44336" },
      { label: "Pass", value: passCount, color: "#4CAF50" },
    ];
  }, [filteredDevices]);

  // Top failed criteria
  const failedHostnames = new Set(
    filteredDevices.filter((d) => (d.total_fail ?? 0) > 0).map((d) => d.hostname)
  );

  const topCriteria = useMemo(() => {
    const counts: Record<string, number> = {};
    violations
      .filter((v) => failedHostnames.has(v.hostname))
      .forEach((v) => {
        counts[v.criteria_name] = (counts[v.criteria_name] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        color: "#2196F3",
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [violations, failedHostnames]);

  const totalDevices = filteredDevices.length;
  const totalFailed = filteredDevices.filter((d) => (d.total_fail ?? 0) > 0).length;

  // Only show failed rules in popup
  const failedRules = useMemo(() => {
    if (!selectedHost) return [];
    const failPatterns = ["n/a", "0", "chưa cấu hình", "no auditing", ""];
    return violations.filter((v) => {
      if (v.hostname !== selectedHost) return false;
      const result = (v.actual_result || "").trim().toLowerCase();
      return failPatterns.some((p) => result.includes(p));
    });
  }, [selectedHost, violations]);

  const toggleExpand = (ruleId: string) => {
    setExpanded((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  return (
    <div className="container mt-4">

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedOS}
            onChange={(e) => setSelectedOS(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Windows</option>
            <option>Linux</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Pass</option>
            <option>Fail</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4" style={{ height: "400px" }}>
        <div className="col-md-6">
          <MyPieChart title="① Tổng kết máy chủ (Đạt/Không đạt)" data={summaryPie} />
        </div>
        <div className="col-md-6">
          <MyPieChart title="② Tổng kết tiêu chí không đạt" data={topCriteria} />
        </div>
      </div>

      {/* Totals */}
      <div className="row text-center mb-4">
        <div className="col-md-6">
          <div className="border rounded p-3 bg-white shadow-sm">
            <h5 className="mb-1">Tổng số máy chủ</h5>
            <span className="fs-4 fw-bold text-primary">{totalDevices}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="border rounded p-3 bg-white shadow-sm">
            <h5 className="mb-1">Tổng số máy chủ vi phạm tuân thủ</h5>
            <span className="fs-4 fw-bold text-danger">{totalFailed}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>STT</th>
              <th>Hostname</th>
              <th>IP</th>
              <th>Hệ điều hành</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((d, i) => {
              const isFail = (d.total_fail ?? 0) > 0;
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{d.hostname}</td>
                  <td>{d.ip || "N/A"}</td>
                  <td>{d.os_name || "Không rõ"}</td>
                  <td>
                    <span
                      className={`badge px-3 py-2 ${isFail ? "bg-danger" : "bg-success"}`}
                      style={{ cursor: isFail ? "pointer" : "default" }}
                      onClick={() => {
                        if (isFail) {
                          setSelectedHost(d.hostname);
                          setExpanded({});
                        }
                      }}
                    >
                      {isFail ? "Fail" : "Pass"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedHost && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết máy chủ</h5>
                <button className="btn-close" onClick={() => setSelectedHost(null)}></button>
              </div>
              <div className="modal-body">
                <div className="p-2">
                  <div className="p-2 mb-2 bg-success bg-opacity-10 fw-semibold border rounded">
                    Hostname: <strong>{selectedHost}</strong>
                  </div>

                  {failedRules.length === 0 && <p>Không có tiêu chí lỗi nào cho máy chủ này.</p>}

                  {failedRules.map((r) => {
                    const expandedRow = expanded[r.rule_id] ?? false;
                    return (
                      <div key={r.rule_id} className="p-2 mb-2 border rounded bg-danger bg-opacity-10">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{r.criteria_name}</strong>
                          <div>
                            <span>Fail</span>
                            <button
                              className="btn btn-sm btn-outline-dark ms-2"
                              onClick={() => toggleExpand(r.rule_id)}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>

                        {expandedRow && (
                          <div className="mt-2 ps-3">
                            <div>
                              <strong>Cấu hình hiện tại:</strong> {r.actual_result || "N/A"}
                            </div>
                            <div>
                              <strong>Cấu hình yêu cầu:</strong> {r.solution || "Không có thông tin"}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-primary" onClick={() => alert("Đã gửi phiếu xử lý tuân thủ!")}>
                  Gửi phiếu xử lý tuân thủ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOsDetail;
