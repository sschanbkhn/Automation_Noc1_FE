import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Spin,
  Empty,
  Typography,
  message,
  Statistic,
  Space,
  Row,
  Col,
  DatePicker,
  Button,
  Tooltip,
} from "antd";
import {
  WarningOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // Hoặc tự tạo link download bằng Blob
import { getBadCellDetail } from "./badCellApi";
import { ClusterOutlined } from "@ant-design/icons";

dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Định dạng dung lượng
const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes === 0) return "0 MB";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Chuyển chuỗi YYYYMMDD sang Dayjs
const parseStringToDayjs = (val) => {
  if (!val) return null;
  const str = val.toString();
  if (str.length !== 8) return dayjs(val);
  return dayjs(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`);
};

const BadCellDetail = ({ cellname }) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState([]);
  const [dateRange, setDateRange] = useState(null);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBadCellDetail(cellname);
      setDetail(res?.data || []);
      console.log("DETAIL DATA:", res?.violations);
    } catch (err) {
      console.error("Fetch detail error:", err);
      message.error("Không thể lấy dữ liệu chi tiết của Cell");
    } finally {
      setLoading(false);
    }
  }, [cellname]);

  useEffect(() => {
    if (!cellname) {
      setDetail([]);
      setDateRange(null);
      return;
    }
    loadDetail();
  }, [cellname, loadDetail]);

  // Bộ lọc dữ liệu theo khoảng ngày chọn
  const filteredDetail = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return detail;
    const [start, end] = dateRange;
    return detail.filter((item) => {
      const itemDate = parseStringToDayjs(item.date);
      if (!itemDate || !itemDate.isValid()) return true;
      return itemDate.isBetween(start.startOf("day"), end.endOf("day"), null, "[]");
    });
  }, [detail, dateRange]);

  // Số ngày CEI < 3
  const badDays = useMemo(() => {
    return filteredDetail.filter((item) => Number(item.CEI) < 3).length;
  }, [filteredDetail]);

  // ==========================================
  // XỬ LÝ XUẤT EXCEL 2 BẢNG BẰNG EXCELJS
  // ==========================================
  const handleExportExcel = async () => {
    if (!filteredDetail.length) {
      message.warning("Không có dữ liệu để xuất Excel!");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Chi Tiết Bad Cell");

      // Set độ rộng cột
      worksheet.columns = [
        { key: "col1", width: 8 },  // STT / Chỉ số
        { key: "col2", width: 16 }, // Ngày / Giá trị
        { key: "col3", width: 22 }, // Cell Name
        { key: "col4", width: 10 }, // CEI
        { key: "col5", width: 12 }, // CEI %
        { key: "col6", width: 12 }, // UX1
        { key: "col7", width: 12 }, // UX2
        { key: "col8", width: 12 }, // UX3
        { key: "col9", width: 20 }, // Upload
        { key: "col10", width: 20 }, // Download
      ];

      // Style dùng chung
      const headerFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1677FF" }, // Xanh dương Ant Design
      };
      const headerFont = { color: { argb: "FFFFFF" }, bold: true, size: 11 };
      const thinBorder = {
        top: { style: "thin", color: { argb: "D9D9D9" } },
        left: { style: "thin", color: { argb: "D9D9D9" } },
        bottom: { style: "thin", color: { argb: "D9D9D9" } },
        right: { style: "thin", color: { argb: "D9D9D9" } },
      };

      // ------------------------------------------
      // BẢNG 1: BẢNG THỐNG KÊ TỔNG QUAN (SUMMARY TABLE)
      // ------------------------------------------
      const titleRow1 = worksheet.addRow(["1. THỐNG KÊ TỔNG QUAN CELL"]);
      titleRow1.font = { bold: true, size: 13, color: { argb: "1677FF" } };
      worksheet.addRow([]); // Dòng trống

      const table1Header = worksheet.addRow(["Tên Cell", "Tổng số ngày", "Số ngày CEI < 3", "Tỷ lệ lỗi (%)"]);
      table1Header.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "595959" } };
        cell.font = headerFont;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder;
      });

      const totalDays = filteredDetail.length;
      const badRate = totalDays > 0 ? ((badDays / totalDays) * 100).toFixed(1) + "%" : "0%";

      const table1Row = worksheet.addRow([cellname, totalDays, badDays, badRate]);
      table1Row.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder;
        if (colNumber === 3 && badDays > 0) {
          cell.font = { color: { argb: "FF4D4F" }, bold: true }; // Tô đỏ số ngày lỗi
        }
      });

      worksheet.addRow([]); // Khoảng nghỉ giữa 2 bảng
      worksheet.addRow([]);

      // ------------------------------------------
      // BẢNG 2: BẢNG CHI TIẾT THEO NGÀY (DETAIL TABLE)
      // ------------------------------------------
      const titleRow2 = worksheet.addRow(["2. CHI TIẾT THÔNG SỐ THEO NGÀY"]);
      titleRow2.font = { bold: true, size: 13, color: { argb: "1677FF" } };
      worksheet.addRow([]); // Dòng trống

      const table2Header = worksheet.addRow([
        "STT",
        "Ngày",
        "Cell Name",
        "CEI",
        "CEI %",
        "UX1",
        "UX2",
        "UX3",
        "Upload (MB)",
        "Download (MB)",
      ]);

      table2Header.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder;
      });

      // Đổ dữ liệu Bảng 2
      filteredDetail.forEach((item, index) => {
        const dateFormatted = parseStringToDayjs(item.date)?.format("DD/MM/YYYY") || item.date;
        const uploadMB = item.vol_uplink ? Number((item.vol_uplink / (1024 * 1024)).toFixed(2)) : 0;
        const downloadMB = item.vol_downlink ? Number((item.vol_downlink / (1024 * 1024)).toFixed(2)) : 0;

        const row = worksheet.addRow([
          index + 1,
          dateFormatted,
          cellname,
          Number(item.CEI) || 0,
          Number(item.CEI_phantram) || 0,
          Number(item.ux_1) || 0,
          Number(item.ux_2) || 0,
          Number(item.ux_3) || 0,
          uploadMB,
          downloadMB,
        ]);

        row.eachCell((cell, colNumber) => {
          cell.border = thinBorder;
          // Căn chỉnh vị trí
          if (colNumber === 1 || colNumber === 2 || colNumber === 3) {
            cell.alignment = { horizontal: "center" };
          } else if (colNumber >= 4 && colNumber <= 7) {
            cell.alignment = { horizontal: "center" };
            // Highlight nếu CEI < 3
            if (colNumber === 4 && Number(item.CEI) < 3) {
              cell.font = { color: { argb: "FF4D4F" }, bold: true };
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F0" } };
            }
          } else {
            cell.alignment = { horizontal: "right" };
          }
        });
      });

      // Tạo Blob và Tải về
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      saveAs(blob, `BaoCao_BadCell_${cellname}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
      message.success("Xuất file Excel với 2 bảng thành công!");
    } catch (error) {
      console.error("ExcelJS Export Error:", error);
      message.error("Có lỗi xảy ra khi xuất file Excel!");
    }
  };

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 120,
      align: "center",
      render: (value) => {
        const formattedDate = parseStringToDayjs(value);
        return (
          <Space size={4}>
            <CalendarOutlined style={{ color: "#8c8c8c" }} />
            <Text strong>
              {formattedDate && formattedDate.isValid()
                ? formattedDate.format("DD/MM/YYYY")
                : value}
            </Text>
          </Space>
        );
      },
    },
    {
          title: "Cell Name",
          key: "cellname",
          width: 220,
          
          render: () => (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              <ClusterOutlined
                style={{
                  color: "#1677ff",
                  fontSize: 16,
                }}
              />

              <span
                style={{
                  color: "#1677ff",
                  fontWeight: 600,
                }}
              >
                {cellname}
              </span>
            </span>
          ),
        },
    {
      title: "CEI",
      dataIndex: "CEI",
      key: "CEI",
      width: 90,
      align: "center",
      render: (value) => {
        const valNum = Number(value);
        let color = "success";
        if (valNum < 3) color = "#ff4d4f";
        else if (valNum < 4) color = "warning";

        return (
          <Tag color={color} style={{ fontWeight: 600, minWidth: 40, textAlign: "center" }}>
            {value}
          </Tag>
        );
      },
    },
    {
      title: "CEI %",
      dataIndex: "CEI_phantram",
      key: "CEI_phamtram",
      width: 90,
      align: "center",
      render: (value) => value,
    },
    {
      title: "UX1",
      dataIndex: "ux_1",
      key: "ux_1",
      width: 75,
      align: "center",
      render: (value) => {
        const valNum = Number(value);
        let color = "success";
        if (valNum < 3) color = "#ff4d4f";
        else if (valNum < 4) color = "warning";

        return (
          <Tag color={color} style={{ fontWeight: 600, minWidth: 40, textAlign: "center" }}>
            {value}
          </Tag>
        );
      },
    },
    {
      title: "UX2",
      dataIndex: "ux_2",
      key: "ux_2",
      width: 75,
      align: "center",
      render: (value) => {
        const valNum = Number(value);
        let color = "success";
        if (valNum < 3) color = "#ff4d4f";
        else if (valNum < 4) color = "warning";

        return (
          <Tag color={color} style={{ fontWeight: 600, minWidth: 40, textAlign: "center" }}>
            {value}
          </Tag>
        );
      },
    },
    {
      title: "UX3",
      dataIndex: "ux_3",
      key: "ux_3",
      width: 75,
      align: "center",
      render: (value) => {
        const valNum = Number(value);
        let color = "success";
        if (valNum < 3) color = "#ff4d4f";
        else if (valNum < 4) color = "warning";

        return (
          <Tag color={color} style={{ fontWeight: 600, minWidth: 40, textAlign: "center" }}>
            {value}
          </Tag>
        );
      },
    },
    {
          title: "Volumn Upload",
          dataIndex: "vol_uplink",
          key: "vol_uplink",
          width: 140,
          align: "center",
          render: (val) => (
                  <span
                  style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 6,
                      whiteSpace: "nowrap",
                  }}
              >
              <CloudUploadOutlined
                style={{
                  color: "#52c41a",
                }}
              />

              {formatBytes(val)}

            </span>
          ),
        },
    {
          title: "Volumn Download",
          dataIndex: "vol_downlink",
          key: "vol_downlink",
          width: 150,
          align: "center",
          render: (val) => (
              <span
                  style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 6,
                      whiteSpace: "nowrap",
                  }}
              >
              <CloudDownloadOutlined
                style={{
                  color: "#1890ff",
                }}
              />
              {formatBytes(val)}
            </span>
          ),
        },
  ];

    if (!cellname) {
        return null;
    }
  console.log(detail);
  return (
    <div
        style={{
            padding: "4px 0",
        }}
    >
      {/* Header Info */}
      {/* <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}> */}
      <Card
          size="small"
          style={{
              marginBottom: 16,
              borderRadius: 8,
              border: "1px solid #d9d9d9",
          }}
      >
    <Row
        justify="space-between"
        align="middle"
    >
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết Cell: <Text type="primary">{cellname}</Text>
          </Title>
        </Col>
        <Col>
          <Card
            size="small"
            style={{
              borderColor: badDays > 0 ? "#ff4d4f" : "#d9d9d9",
              backgroundColor: badDays > 0 ? "#fff2f0" : "#fafafa",
              borderRadius: 8,
            }}
          >
            <Statistic
              title="Số ngày CEI < 3"
              value={badDays}
              valueStyle={{
                color: badDays > 0 ? "#cf1322" : "#3f8600",
                fontSize: 18,
                fontWeight: "bold",
              }}
              prefix={badDays > 0 ? <WarningOutlined /> : null}
            />
          </Card>
        </Col>
      </Row>
</Card>
      {/* Toolbar */}
      <Card
          size="small"
          style={{
              marginBottom: 16,
              borderRadius: 8,
              border: "1px solid #e7ec98",
          }}
      >
          <div
              style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
              }}
          >

              {/* Bên trái: chọn ngày */}
              <div
                  style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                  }}
              >
                  <span
                      style={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                      }}
                  >
                      <FilterOutlined /> Lọc ngày:
                  </span>
                  <RangePicker
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates)}
                      format="DD/MM/YYYY"
                      allowClear
                      style={{
                          width: 280,
                      }}
                  />
              </div>
              {/* Bên phải: button */}
              <div
                  style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                  }}
              >
                  <Tooltip title="Làm mới">
                      <Button
                          icon={<ReloadOutlined />}
                          onClick={loadDetail}
                          loading={loading}
                      />
                  </Tooltip>
                  <Button
                      type="primary"
                      style={{
                          backgroundColor: "#217346",
                          borderColor: "#217346",
                      }}
                      icon={<FileExcelOutlined />}
                      onClick={handleExportExcel}
                      disabled={filteredDetail.length === 0}
                  >
                      Xuất Excel
                  </Button>
              </div>
          </div>
      </Card>
      {/* Table Display */}
      <Card
    size="small"
    title="Chi tiết KPI theo ngày"
    style={{
        borderRadius:8,
        border:"1px solid #f8fa9e"
    }}
    >
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
       <Table
          rowKey={(r) => r.date || Math.random()}
          columns={columns}
          dataSource={filteredDetail}

          rowClassName={(record) =>
              record.date === record.date_shutdown
                  ? "shutdown-row"
                  : ""
          }

          pagination={{
              pageSize: 8,
              showSizeChanger: false,
              position: ["bottomCenter"]
          }}
  bordered
  size="middle"
  scroll={{ x: "max-content" }}
/>
      </Spin>
      </Card>
    </div>
  );
};

export default BadCellDetail;