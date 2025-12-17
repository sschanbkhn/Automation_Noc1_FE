import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyPieChart from "./MyPieChart";
import MyBarChart from "./MyBarChart";

interface UCProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: React.Dispatch<
    React.SetStateAction<{
      os?: string;
      status?: string;
    }>
  >;
}

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
  solution?: string;
  actual_result?: string;
  hostname: string;
}

const OS_COLORS: Record<string, string> = {
  Windows: "#4F46E5",
  Linux: "#10B981",
  Other: "#F59E0B",
};

function normalizeOS(osName: string | undefined): "Windows" | "Linux" | "Other" {
  const n = (osName || "").toLowerCase();
  if (n.includes("windows")) return "Windows";
  // if (n.includes("linux")) return "Linux";
  return "Linux";
}

const Dashboard: React.FC<UCProps> = ({ goToTab, setFilters }) => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(
            "http://10.147.50.118:5678/webhook/d472d814-9f1f-4308-8d66-9cafdf4d3d2aserverget"
          ),
          fetch(
            "http://10.147.50.118:5678/webhook/d472d814-9f1f-4308-8d66-9cafdf4d3d2aserverget?status=detail&hn=WIN-DC012J0ESCI"
          ),
        ]);

        const [devicesJson, violationsJson] = await Promise.all([
          res1.json(),
          res2.json(),
        ]);

        const parsedDevices = Array.isArray(devicesJson?.data)
          ? devicesJson.data
          : [];
        const parsedViolations = Array.isArray(violationsJson?.data)
          ? violationsJson.data
          : [];

        setDevices(parsedDevices);
        setViolations(parsedViolations);
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
        setDevices([]);
        setViolations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Derived metrics ---
  const osBuckets = useMemo(() => {
    const map: Record<string, { total: number; failedDevices: number }> = {};
    for (const d of devices) {
      const os = normalizeOS(d.os_name);
      if (!map[os]) map[os] = { total: 0, failedDevices: 0 };
      map[os].total += 1;
      if ((d.total_fail ?? 0) > 0) map[os].failedDevices += 1;
    }

    for (const os of ["Windows", "Linux"]) {
      if (!map[os]) map[os] = { total: 0, failedDevices: 0 };
    }
    return map;
  }, [devices]);

  const osFailRateBar = useMemo(
    () =>
      Object.entries(osBuckets)
        .map(([os, { total, failedDevices }]) => ({
          label: os,
          value: total ? Math.round((failedDevices / total) * 100) : 0,
          rawFail: failedDevices,
          rawTotal: total,
          color: OS_COLORS[os] || "#999",
        }))
        .sort((a, b) => b.value - a.value),
    [osBuckets]
  );

  const osPie = useMemo(
    () =>
      Object.entries(osBuckets)
        .map(([os, { total }]) => ({
          label: os,
          value: total,
          color: OS_COLORS[os] || "#999",
        }))
        .sort((a, b) => b.value - a.value),
    [osBuckets]
  );

  const topDevices = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of violations) {
      counts.set(v.hostname, (counts.get(v.hostname) || 0) + 1);
    }

    const list =
      counts.size === 0
        ? devices.map((d) => ({
            label: d.hostname,
            value: d.total_fail ?? 0,
            color: "#F59E0B",
          }))
        : Array.from(counts.entries()).map(([label, value]) => ({
            label,
            value,
            color: "#F59E0B",
          }));

    return list.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [violations, devices]);

  const topCriteria = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of violations) {
      const label = v.criteria_name || v.rule_id;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value, color: "#4F46E5" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [violations]);

  const totalDevices = devices.length;
  const failedDevices = devices.filter((d) => (d.total_fail ?? 0) > 0).length;

  const handleBarClick = (item: any) => {
    if (goToTab && setFilters) {
      setFilters({ os: item.label }); // ✅ Send OS to UC2 filter
      goToTab("uc2"); // ✅ Navigate to detailed tab
    } else {
      navigate(`/uc2?os=${encodeURIComponent(item.label)}`);
    }
  };

  const handlePieClick = (item: any) => handleBarClick(item);

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">
        🔄 Đang tải dữ liệu, vui lòng chờ...
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Máy chủ - Báo cáo theo Hệ điều hành</h2>

      {/* Totals */}
      <div className="mb-3">
        <strong>Tổng số máy chủ:</strong> {totalDevices} &nbsp; | &nbsp;
        <strong>Tổng số máy chủ vi phạm tuân thủ:</strong> {failedDevices}
      </div>

      {/* Row 1: OS charts */}
      <div className="row mb-4" style={{ width: "100%", height: "400px" }}>
        <div className="col-md-6">
          <MyBarChart
            title="🚩 Tỷ lệ lỗi theo OS (%)"
            data={osFailRateBar}
            onClickBar={handleBarClick}
          />
        </div>

        <div className="col-md-6">
          <MyPieChart
            title="📊 Phân bổ số lượng máy chủ theo OS"
            data={osPie}
            onClickSlice={handlePieClick}
          />
        </div>
      </div>

      {/* Row 2: Top violations */}
      <div className="row mb-4" style={{ width: "100%", height: "400px" }}>
        <div className="col-md-6">
          <MyBarChart
            title="🔥 Top 5 máy chủ có số lượng không tuân thủ nhiều nhất"
            data={topDevices}
            onClickBar={handleBarClick}
          />
        </div>

        <div className="col-md-6">
          <MyBarChart
            title="📌 Top 5 tiêu chí vi phạm nhiều nhất"
            data={topCriteria}
            onClickBar={handleBarClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
