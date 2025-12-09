// src/components/R003-PRBLoadBalancing/R003Zone2TrendAnalysis.tsx

import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Form } from "react-bootstrap";
import type { Zone2MainProps, LevelType, ProvinceItem, DistrictItem } from "./R003Zone2Types";

// Import Charts (sẽ tạo sau)
// import R003Zone2Chart1TrendAnalysis from './R003Zone2Chart1TrendAnalysis';
// import R003Zone2Chart2Comparison from './R003Zone2Chart2Comparison';
// ... import các charts khác

// Thêm vào đầu file
import R003Zone2Chart1TrendAnalysis from "./R003Zone2Chart1TrendAnalysis";
import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig"; // ← THÊM IMPORT

const R003Zone2TrendAnalysis: React.FC<Zone2MainProps> = ({ selectedDate }) => {
  // ==========================================================================
  // STATE MANAGEMENT - Centralized cho tất cả charts
  // ==========================================================================

  const [level, setLevel] = useState<LevelType>("network");
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");

  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);

  // ← THÊM STATE CHO CHART SELECTOR
  const [selectedChart, setSelectedChart] = useState<string>("combined");

  // ==========================================================================
  // API CALLS
  // ==========================================================================

  /**
   * Fetch danh sách provinces
   */
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/list-provinces?date=${selectedDate}`);
      // url = `${API_CONFIG.BASE_URL}/dashboard/trend-province?endDate=${selectedDate}&provinceCode=${provinceCode}`;
      const result = await response.json();

      if (result.success) {
        setProvinces(result.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  /**
   * Fetch danh sách districts theo province
   */
  const fetchDistricts = async (provinceCode: string) => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }

    try {
      setLoadingDistricts(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/list-districts?date=${selectedDate}&provinceCode=${provinceCode}`);
      const result = await response.json();

      if (result.success) {
        setDistricts(result.data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Fetch provinces khi component mount hoặc date thay đổi
   */
  /*
  useEffect(() => {
    fetchProvinces();
  }, [selectedDate]);

  */

  // SAU (ĐÚNG):
  useEffect(() => {
    if (level === "province" || level === "district") {
      console.log("✅ Fetching provinces for level:", level);
      fetchProvinces();
    }
  }, [selectedDate, level]); // ← THÊM level vào dependency

  /**
   * Fetch districts khi level = district và provinceCode thay đổi
   */
  /*
  useEffect(() => {
    if (level === "district" && provinceCode) {
      fetchDistricts(provinceCode);
    }
  }, [level, provinceCode, selectedDate]);
*/
  useEffect(() => {
    if (level === "district" && provinceCode) {
      fetchDistricts(provinceCode);
    }
  }, [level, provinceCode, selectedDate]);

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Handle thay đổi level
   */
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value as LevelType;
    setLevel(newLevel);

    // Reset selections khi đổi level
    if (newLevel === "network") {
      setProvinceCode("");
      setDistrictCode("");
    } else if (newLevel === "province") {
      setDistrictCode("");
    }
  };

  /**
   * Handle thay đổi province
   */
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvinceCode = e.target.value;
    setProvinceCode(newProvinceCode);
    setDistrictCode(""); // Reset district khi đổi province
  };

  /**
   * Handle thay đổi district
   */
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrictCode(e.target.value);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Container fluid className="py-4">
      {/* HEADER - 1 HÀNG DUY NHẤT */}
      <Card className="mb-4 shadow-sm">
        {/* ← SỬA: NỀN TRẮNG, CHỮ XANH */}
        <Card.Header className="bg-white border-bottom">
          <h4 className="mb-0 text-primary">
            <i className="bi bi-graph-up me-2"></i>
            Trend & Analysis
          </h4>
        </Card.Header>
        {/* // ========================================================================== */}
        <Card.Body className="py-3">
          {/* ← TẤT CẢ TRÊN 1 HÀNG */}
          <Row className="g-3 align-items-end">
            {/* ← THÊM CHART SELECTOR DROPDOWN */}
            <Col md={3}>
              <Form.Label className="fw-bold mb-1 small">Chart Type:</Form.Label>
              <Form.Select value={selectedChart} onChange={(e) => setSelectedChart(e.target.value)}>
                <option value="combined">📊 Combined</option>
                <option value="performance">⚡ Performance</option>
                <option value="breakdown">📊 Breakdown</option>
                <option value="congested">🔴 Congested</option>
                <option value="processing">⚡ Processing</option>
                <option value="existing">📦 Existing</option>
                <option value="blacklist">🚫 Blacklist</option>
                <option value="resolved">✅ Resolved</option>
                <option value="new">🆕 New</option>
                <option value="comparison">🔍 Comparison</option>
              </Form.Select>
            </Col>
            {/* // ========================================================================== */}
            {/* Level Selector */}
            {/* // ========================================================================== */}
            {/* View Level */}
            <Col md={3}>
              <Form.Label className="fw-bold mb-1 small">View Level:</Form.Label>
              <Form.Select value={level} onChange={handleLevelChange}>
                <option value="network">🌐 Network</option>
                <option value="province">🏙️ Province</option>
                <option value="district">🏘️ District</option>
              </Form.Select>
            </Col>
            {/* // ========================================================================== */}
            {/* // ========================================================================== */}
            {/* Province Selector - Chỉ hiện khi level = province hoặc district */}
            {/* Province */}

            {/* Province - Hiện khi level = province HOẶC district */}
            {(level === "province" || level === "district") && (
              <Col md={3}>
                <Form.Label className="fw-bold mb-1 small">Province:</Form.Label>
                <Form.Select value={provinceCode} onChange={handleProvinceChange} disabled={loadingProvinces}>
                  <option value="">Select Province...</option>
                  {provinces.map((p) => (
                    <option key={p.provinceCode} value={p.provinceCode}>
                      {p.provinceCode}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
            {/* // ========================================================================== */}
            {/* // ========================================================================== */}
            {/* District Selector - Chỉ hiện khi level = district */}
            {/* District */}
            {/* District - CHỈ hiện khi level = district */}
            {level === "district" && (
              <Col md={3}>
                <Form.Label className="fw-bold mb-1 small">District:</Form.Label>
                <Form.Select value={districtCode} onChange={handleDistrictChange} disabled={level !== "district" || !provinceCode || loadingDistricts}>
                  <option value="">Select District...</option>
                  {districts.map((d) => (
                    <option key={d.districtCode} value={d.districtCode}>
                      {d.districtCode}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
            {/* // ========================================================================== */}
          </Row>
        </Card.Body>
      </Card>
      {/* // ========================================================================== */}
      {/* <R003Zone2Chart1TrendAnalysis selectedDate={selectedDate} level={level} provinceCode={provinceCode} districtCode={districtCode} /> */}

      {/* CHART COMPONENT */}
      <R003Zone2Chart1TrendAnalysis selectedDate={selectedDate} level={level} provinceCode={provinceCode} districtCode={districtCode} selectedChart={selectedChart} />

      {/* CHARTS SECTION - Sẽ uncomment khi tạo xong charts */}
      {/* 

      <R003Zone2Chart1TrendAnalysis
        selectedDate={selectedDate}
        level={level}
        provinceCode={provinceCode}
        districtCode={districtCode}
      />

      <R003Zone2Chart2Comparison
        selectedDate={selectedDate}
        level={level}
        provinceCode={provinceCode}
        districtCode={districtCode}
      />

      ... các charts khác
      */}

      {/* TEMPORARY - Hiển thị trạng thái hiện tại */}
      {/*
      <Card>
        <Card.Body>
          <h5>Current State (Debug):</h5>
          <pre>{JSON.stringify({ level, provinceCode, districtCode }, null, 2)}</pre>
        </Card.Body>
      </Card>

      */}
    </Container>
  );
};

export default R003Zone2TrendAnalysis;

/*

1. State Management:
typescriptconst [level, setLevel] = useState('network');           // Level hiện tại
const [provinceCode, setProvinceCode] = useState('');    // Province đã chọn
const [districtCode, setDistrictCode] = useState('');    // District đã chọn
const [provinces, setProvinces] = useState([]);          // Danh sách provinces
const [districts, setDistricts] = useState([]);          // Danh sách districts

*/
