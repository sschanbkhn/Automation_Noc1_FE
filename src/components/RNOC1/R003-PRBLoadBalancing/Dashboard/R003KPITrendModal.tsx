import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faDownload, faChartLine } from "@fortawesome/free-solid-svg-icons";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import axios from "axios";

import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";

interface KPITrendModalProps {
  show: boolean;
  onClose: () => void;
  cellData: any;
  startDate: string;
  endDate: string;
}

const KPITrendModal: React.FC<KPITrendModalProps> = ({ show, onClose, cellData, startDate, endDate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [crExecutionDates, setCrExecutionDates] = useState([]);

  useEffect(() => {
    if (show && cellData) {
      fetchTrendData();

      // Fetch CR execution dates
      fetchCRExecutionDates();
    }
  }, [show, cellData]);

  useEffect(() => {
    if (trendData.length > 0) {
      console.log("📊 TREND DATA TIME FORMAT:");
      console.log(
        "First 10 times:",
        trendData.slice(0, 10).map((d) => d.time)
      );
      console.log("🔍 Looking for CR date:", crExecutionDates);

      // Kiểm tra có match không
      const hasMatch = trendData.some((d) => crExecutionDates.includes(d.time));
      console.log("✅ Has matching time?", hasMatch);
    }
  }, [trendData, crExecutionDates]);

  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Trừ 1 ngày trước khi gọi API
      const selectedDate = new Date(endDate);
      selectedDate.setDate(selectedDate.getDate() - 1 + 1);
      const apiDate = selectedDate.toISOString().split("T")[0];
      const response = await axios.get(`${API_CONFIG.BASE_URL}/dashboard/kpi-trend-prbs`, {
        params: {
          dn_mrbts_site: cellData.dn_mrbts_site,
          // lncell_name: cellData.lncel_name || cellData.cell_name,
          // selected_date: endDate, // ← Chỉ truyền 1 ngày
          selected_date: apiDate, // ← MỚI: Truyền ngày đã trừ 1
        },
      });

      setTrendData(response.data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải dữ liệu trend");
      console.error("Error fetching trend data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCRExecutionDates = async () => {
    console.log("🚀 fetchCRExecutionDates STARTED"); // ← THÊM
    console.log("cellData:", cellData); // ← THÊM
    console.log("endDate:", endDate); // ← THÊM
    try {
      const cellId = cellData.dn_mrbts_site || cellData.lncel_name;
      // const response = await axios.get(`${API_CONFIG.BASE_URL}/cr-execution-dates?cellId=${cellId}`);
      // const response = await axios.get(`${API_CONFIG.BASE_URL}/cr-execution-dates?cellId=${cellData.cell_id || cellData.lncel_name}`);
      // const response = await axios.get(`${API_CONFIG.BASE_URL}/dashboard/cr-execution-dates`, {
      // params: { cellId },
      // });
      const selectedDate = new Date(endDate);
      const apiDate = selectedDate.toISOString().split("T")[0];
      console.error("apiDate:", apiDate);

      // const cellId = cellData.dn_mrbts_site || cellData.lncel_name;
      console.log("🔑 cellId being sent:", cellId);

      const response = await axios.get(`${API_CONFIG.BASE_URL}/dashboard/cr-logs-dates`, {
        params: {
          cellId,
          selectedDate: apiDate,
        },
      });
      // Response format: ["2024-11-01", "2024-11-05", "2024-11-07"]
      console.error("apiDate:", `${API_CONFIG.BASE_URL}/dashboard/cr-logs-dates`);
      setCrExecutionDates(response.data.dates);

      console.log("📊 CR Response:", response.data); // ← THÊM DÒNG NÀY
      console.log("📊 CR Dates Array:", response.data.dates); // ← THÊM DÒNG NÀY
    } catch (error) {
      console.error("Error fetching CR execution dates:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
        }}
      >
        <Modal.Title>
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          KPI Trend - {cellData?.lncel_name}
        </Modal.Title>
        <Button variant="link" onClick={onClose} style={{ color: "white", fontSize: "1.5rem" }}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Modal.Header>

      <Modal.Body style={{ minHeight: "500px", padding: "20px" }}>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tải dữ liệu trend...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <strong>Lỗi:</strong> {error}
          </Alert>
        )}

        {!loading && !error && trendData.length > 0 && (
          <div>
            <div
              className="mb-4"
              style={{
                padding: "15px",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <div className="row">
                {/*}
                <div className="col-md-4">
                  <strong>Cell ID:</strong> <span className="text-primary">{cellData.cell_id}</span>
                </div>
                <div className="col-md-4">
                  <strong>Cell Name:</strong> <span className="text-primary">{cellData.cell_name}</span>
                </div>
                */}
                {/*}
                <div className="col-md-4">
                  <strong>Thời gian:</strong>{" "}
                  <span className="text-primary">
                    {startDate} ~ {endDate}
                  </span>
                </div>
                */}
                <div className="col-md-4">
                  <strong>Dn_mrbts:</strong> <span className="text-primary">{cellData.dn_mrbts_site || cellData.mrbts_name || "N/A"}</span>
                </div>

                <div className="col-md-4">
                  <strong>Cell Name:</strong> <span className="text-primary">{cellData.lncel_name || "N/A"}</span>
                </div>

                <div className="col-md-4">
                  <strong>Thời gian: </strong>
                  {/*}
                  <span className="text-primary">
                    {startDate} đến {endDate}
                  </span>
                  */}
                  <span className="text-primary">
                    {(() => {
                      const end = new Date(endDate);
                      end.setDate(end.getDate() - 1 + 1); // 2025-10-07

                      const start = new Date(end);
                      start.setDate(start.getDate() - 20); // 2025-09-17

                      return `${start.toISOString().split("T")[0]} đến ${end.toISOString().split("T")[0]} (hour)`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />

                {/* Đường threshold ngang màu đỏ */}
                <ReferenceLine y={70} stroke="red" strokeWidth={2} strokeDasharray="5 5" label="Threshold 70%" />

                {/* Các đường dọc màu vàng da cam - thời điểm chạy CR */}
                {/*}
                {crExecutionDates.map((date, index) => (
                  <ReferenceLine key={index} x={date} stroke="orange" strokeWidth={2} strokeDasharray="3 3" label={{ value: "CR", position: "top" }} />
                ))}
*/}

                {(() => {
                  console.log("🎨 crExecutionDates in render:", crExecutionDates);
                  return crExecutionDates.map((date, index) => <ReferenceLine key={index} x={date} stroke="orange" strokeWidth={2} strokeDasharray="3 3" label={{ value: "CR", position: "top" }} />);
                })()}

                {/* <XAxis dataKey="time" label={{ value: "Thời gian", position: "insideBottom", offset: -5 }} angle={-45} textAnchor="end" height={80} /> */}
                <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} interval="preserveStartEnd" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "PRB Usage (%)", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
                <Tooltip />
                <Legend />

                <Line type="monotone" dataKey="dl_prb_usage" stroke="#110eedff" name="DL PRB Usage (%)" strokeWidth={2} dot={false} />
                {/* <Line type="monotone" dataKey="ul_prb_usage" stroke="#82ca9d" name="UL PRB Usage (%)" strokeWidth={2} dot={false} /> */}
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 text-muted small">
              <strong>Tổng số điểm dữ liệu:</strong> {trendData.length} records
            </div>
          </div>
        )}

        {!loading && !error && trendData.length === 0 && (
          <Alert variant="info">
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Không có dữ liệu trend cho cell này trong khoảng thời gian đã chọn.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer style={{ borderTop: "2px solid #e9ecef" }}>
        {/* ======================================================================== */}
        <Button
          variant="primary"
          onClick={() => {
            // Export logic sẽ implement sau
            alert("Tính năng Export đang phát triển");
          }}
          disabled={trendData.length === 0}
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Export PNG
        </Button>
        {/* ======================================================================== */}

        <Button variant="secondary" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          Đóng
        </Button>
        {/* ======================================================================== */}
      </Modal.Footer>
    </Modal>
  );
};

export default KPITrendModal;
