import React from "react";
import { Button } from "react-bootstrap";
import dayjs from "dayjs";

// Khai báo trực tiếp tại đây nếu không muốn tạo file riêng
const StatusBadge = ({ status }) => {
  const map = {
    success: { label: "Thành công", color: "success", icon: "✅" },
    failed: { label: "Thất bại", color: "danger", icon: "❌" },
    warning: { label: "Cảnh báo", color: "warning", icon: "⚠️" },
    partial: { label: "Một phần", color: "secondary", icon: "🟡" },
    null: { label: "Chưa chạy", color: "secondary", icon: "⏳" },
  };
  const s = map[status] || map.null;
  return (
    <span className={`badge bg-${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
};

// 1. Danh sách các Tab (Usecase)
// 1. Danh sách các Tab (Usecase)
export const USECASE_TYPES = [
  { id: "dhtt", label: "🛠️ Bảo Dưỡng",   color: "info"    },  // ← đổi tên, giữ đầu tiên
  { id: "kpi",  label: "📊 Quản lý KPI", color: "primary" },
];

// 2. Định nghĩa các cột của bảng
export const getColumns = (handleToggle, handleEdit, handleDelete) => [
  { label: "Tên", key: "name" },
  { 
    label: "Usecase", 
    key: "usecase", 
    render: (val) => (
      <span className={`badge ${val === 'dhtt' ? 'bg-info' : 'bg-dark'}`}>
        {val?.toUpperCase() || 'KPI'}
      </span>
    ) 
  },
  { 
    label: "Action", 
    key: "action", 
    render: (val) => <code className="text-primary">{val || "causecode"}</code> 
  },
  { label: "Platform", key: "platform" },
  { label: "Cron", key: "cron" },
  { 
    label: "Thiết bị", 
    key: "node_names", 
    render: (val) => (val || []).join(", ") 
  },
  { 
    label: "Trạng thái", 
    key: "enabled", 
    render: (val, row) => (
      <Button
        variant={val ? "success" : "secondary"}
        size="sm"
        onClick={() => handleToggle(row)}
      >
        {val ? "🟢 Bật" : "🔴 Tắt"}
      </Button>
    ) 
  },
  { 
    label: "Chạy gần nhất", 
    key: "last_run_at", 
    render: (val) => val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "Chưa chạy" 
  },
  { 
    label: "Kết quả", 
    key: "result_summary", 
    render: (val, row) => val || <StatusBadge status={row.last_run_status} /> 
  },
  { 
    label: "Thao tác", 
    key: "actions", 
    render: (_, row) => (
      <div className="d-flex gap-1">
        <Button size="sm" variant="warning" onClick={() => handleEdit(row)}>✏️</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>🗑️</Button>
      </div>
    )
  },
];