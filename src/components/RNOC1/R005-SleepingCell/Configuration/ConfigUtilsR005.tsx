import React from "react";
import { ModuleStatus } from "./ConfigTypes";

export const formatHeaderName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const formatCellValue = (value: any, key: string): string => {
  if (key.toLowerCase().includes("password")) return "••••••••";

  // PHẢI ĐẶT TRƯỚC boolean check
  if (key.toLowerCase().includes("blacklist")) {
    return value === true ? "Blacklisted" : "";
  }

  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  // if (value === null || value === undefined) return "";

  if (value === null || value === undefined || value === "") return ""; // Trả về rỗng thay vì "N/A"
  // if (value === "0" || value === 0) return "0"; // Trả về rỗng thay vì "N/A"
  // Xử lý riêng cho blacklist

  return String(value);
};

export const shouldHideColumn = (key: string, moduleId: number): boolean => {
  if (key.toLowerCase() === "id") return true;

  // Ẩn cột đặc biệt cho MRBTS (id=3)
  if (moduleId === 3 && key.toLowerCase().includes("objtable4gkpireportresultdetails")) {
    return true;
  }

  return false;
};

// EXPORT function này để sử dụng
export const getStatusBadge = (status: ModuleStatus): React.ReactElement => {
  const config = status === "active" ? { bg: "#d4edda", color: "#155724", text: "Active", border: "#c3e6cb" } : { bg: "#fff3cd", color: "#856404", text: "Maintenance", border: "#ffeaa7" };

  return (
    <div
      style={{
        background: config.bg,
        color: config.color,
        fontSize: "10px",
        padding: "2px 6px",
        borderRadius: "8px",
        fontWeight: "600",
        border: `1px solid ${config.border}`,
      }}
    >
      {config.text}
    </div>
  );
};

export const createEmptyFormData = (sampleItem: any, moduleId: number): any => {
  return Object.keys(sampleItem)
    .filter((key) => !shouldHideColumn(key, moduleId))
    .reduce((acc, key) => {
      acc[key] = typeof sampleItem[key] === "boolean" ? false : "";
      return acc;
    }, {} as any);
};
