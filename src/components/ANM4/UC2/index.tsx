import React, { useEffect, useState } from "react";
import DashboardOsDetail from "./Dashboard"; // ✅ ensure path is correct

interface UCProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: React.Dispatch<
    React.SetStateAction<{
      os?: string;
      status?: string;
    }>
  >;
  filters?: {
    os?: string;
    status?: string;
  };
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
  hostname: string;
  solution?: string;
  actual_result?: string;
}

const Anm4_uc2: React.FC<UCProps> = ({ goToTab, setFilters, filters }) => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [loading, setLoading] = useState(true);

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

        console.log("✅ Devices fetched:", parsedDevices.length);
        console.log("✅ Violations fetched:", parsedViolations.length);
      } catch (err) {
        console.error("❌ Failed to fetch OS detail data:", err);
        setDevices([]);
        setViolations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5 text-secondary">
        🔄 Đang tải dữ liệu chi tiết, vui lòng chờ...
      </div>
    );
  }

  return (
    <DashboardOsDetail
      devices={devices}
      violations={violations}
      filters={filters} // ✅ Pass filter from UC1 here
    />
  );
};

export default Anm4_uc2;
