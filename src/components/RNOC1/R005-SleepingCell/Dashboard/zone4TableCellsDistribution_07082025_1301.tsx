import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";

interface Zone4TableCells_DistributionChartProps {
  dashboardData?: any;
  loading?: boolean;
  selectedDate?: string;
}

interface DistrictData {
  district: string;
  processCells: number;
  successCells: number;
  failCells: number;
  successRate?: number;
}

interface ProvinceData {
  province: string;
  districts: number;
  totalCells: number;
  sleepingCells: number;
  processCells: number;
  successCells: number;
  failCells: number;
  successRate: number;
  districtDetails: DistrictData[];
  isExpanded?: boolean;
}

const Zone4TableCells_DistributionChart: React.FC<Zone4TableCells_DistributionChartProps> = ({ dashboardData, loading, selectedDate }) => {
  const [tableData, setTableData] = useState<ProvinceData[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch table data
  useEffect(() => {
    let isMounted = true;
    console.log("🎯 Zone4 selectedDate changed:", selectedDate);

    const fetchTableData = async (date: string) => {
      if (!isMounted) return;
      try {
        console.log("🔄 fetchTableData called with date:", date);
        setTableLoading(true);
        // const response = await fetch(`https://localhost:7232/api/dashboard/zone4-summary/${date}`);
        // https://localhost:7232/api/dashboard/zone4-summary/2025-08-05
        const response = await fetch(`https://localhost:7232/api/dashboard/zone4-summary/${date}`);
        console.log("📥 API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("📊 Table data received:", result);

        if (isMounted) {
          // Add isExpanded property and calculate district success rates
          const dataWithExpanded =
            result.data?.map((province: ProvinceData) => ({
              ...province,
              isExpanded: false,
              districtDetails:
                province.districtDetails?.map((district: DistrictData) => ({
                  ...district,
                  successRate: district.processCells > 0 ? Math.round((district.successCells / district.processCells) * 100 * 10) / 10 : 0,
                })) || [],
            })) || [];

          setTableData(dataWithExpanded);
          setError(null);
        }
      } catch (err: any) {
        console.error("Table API Error:", err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setTableLoading(false);
        }
      }
    };

    if (selectedDate) {
      console.log("📞 Calling fetchTableData...");
      fetchTableData(selectedDate);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Toggle province expansion
  const toggleProvince = (index: number) => {
    setTableData((prev) => prev.map((province, i) => (i === index ? { ...province, isExpanded: !province.isExpanded } : province)));
  };

  // Get success rate badge color
  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    if (rate >= 40) return "info";
    return "danger";
  };

  // Loading state
  if (tableLoading) {
    return (
      <div className="mb-4" style={{ marginTop: "-20px" }}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 text-center">
            <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
              <div>
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Đang tải dữ liệu Zone 4 Table...</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-4" style={{ marginTop: "-20px" }}>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          {/* Header */}
          {/*
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div className="p-2 rounded-circle me-3" style={{ backgroundColor: "#e8f4fd" }}>
                <span style={{ fontSize: "1.5rem" }}>📋</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0">Zone 4 Data Table</h5>
                <small className="text-muted">Detailed Province & District Analysis</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div className="text-center">
                <h3 className="fw-bold text-primary mb-0">{tableData.length}</h3>
                <small className="text-muted">Provinces</small>
              </div>
              <div className="text-center">
                <h3 className="fw-bold text-warning mb-0">{tableData.reduce((sum, p) => sum + p.districts, 0)}</h3>
                <small className="text-muted">Districts</small>
              </div>
              <div className="text-center">
                <h3 className="fw-bold text-success mb-0">{tableData.length > 0 ? Math.round(tableData.reduce((sum, p) => sum + p.successRate, 0) / tableData.length) : 0}%</h3>
                <small className="text-muted">Avg Success</small>
              </div>
            </div>
          </div>

          */}

          {/* Error warning */}
          {error && (
            <div className="alert alert-warning alert-dismissible" role="alert">
              <small>
                <strong>⚠️ Warning:</strong> {error}
              </small>
            </div>
          )}

          {/* Data Table */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">Provinces & Districts Data Table</h6>
              <small className="text-muted">📅 Date: {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}</small>
            </div>

            {tableData.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "200px" }}>Province</th>
                      <th style={{ width: "100px" }} className="text-center">
                        Districts
                      </th>
                      <th style={{ width: "120px" }} className="text-center">
                        Total Cell
                      </th>
                      <th style={{ width: "120px" }} className="text-center">
                        Sleeping
                      </th>
                      <th style={{ width: "120px" }} className="text-center">
                        Process
                      </th>
                      <th style={{ width: "120px" }} className="text-center">
                        Success
                      </th>
                      <th style={{ width: "120px" }} className="text-center">
                        Fail
                      </th>
                      <th style={{ width: "130px" }} className="text-center">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((province, index) => (
                      <React.Fragment key={province.province}>
                        {/* Province Row */}
                        <tr className="table-row-hover" style={{ cursor: "pointer" }} onClick={() => toggleProvince(index)}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Button variant="link" size="sm" className="p-0 me-2 text-decoration-none" style={{ minWidth: "20px" }}>
                                {province.isExpanded ? "−" : "+"}
                              </Button>
                              <strong className="text-primary">{province.province}</strong>
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge bg="secondary">{province.districts}</Badge>
                          </td>
                          <td className="text-center">
                            <strong>{province.totalCells.toLocaleString()}</strong>
                          </td>
                          <td className="text-center">
                            <span className="text-danger fw-semibold">{province.sleepingCells}</span>
                          </td>
                          <td className="text-center">
                            <span className="text-info fw-semibold">{province.processCells}</span>
                          </td>
                          <td className="text-center">
                            <span className="text-success fw-semibold">{province.successCells}</span>
                          </td>
                          <td className="text-center">
                            <span className="text-danger fw-semibold">{province.failCells}</span>
                          </td>
                          <td className="text-center">
                            <Badge bg={getSuccessRateBadge(province.successRate)} className="fs-6">
                              {province.successRate}%
                            </Badge>
                          </td>
                        </tr>

                        {/* District Rows (Expanded) */}
                        {province.isExpanded &&
                          province.districtDetails.map((district, districtIndex) => (
                            <tr key={`${province.province}-${district.district}`} className="table-light">
                              <td>
                                <div className="d-flex align-items-center ps-4">
                                  <span className="text-muted me-2">├─</span>
                                  <span className="text-secondary">{district.district}</span>
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="text-muted">−</span>
                              </td>
                              <td className="text-center">
                                <span className="text-muted">−</span>
                              </td>
                              <td className="text-center">
                                <span className="text-muted">−</span>
                              </td>
                              <td className="text-center">
                                <span className="text-info">{district.processCells}</span>
                              </td>
                              <td className="text-center">
                                <span className="text-success">{district.successCells}</span>
                              </td>
                              <td className="text-center">
                                <span className="text-danger">{district.failCells}</span>
                              </td>
                              <td className="text-center">
                                {/* <Badge bg={getSuccessRateBadge(district.successRate || 0)} size="sm"> */}
                                <Badge bg={getSuccessRateBadge(district.successRate || 0)} className="badge-sm">
                                  {district.successRate}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No data available for selected date</p>
              </div>
            )}

            {/* Summary */}
            {tableData.length > 0 && (
              <div className="text-center pt-3 border-top mt-3">
                <small className="text-muted">
                  Total: <strong>{tableData.reduce((sum, p) => sum + p.totalCells, 0).toLocaleString()}</strong> cells across <strong>{tableData.length}</strong> provinces
                </small>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Zone4TableCells_DistributionChart;
