import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API_URL from "./apiConfig";

interface Props {
  onClickBox: (apiKey: string | string[]) => void;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28",
  "#FE0015", "#79C400", "#FF28AD",
  "#00FE2A", "#C4B000", "#BB28FF", "#28FFAD"
];

export default function PieWithPercentage({ onClickBox }: Props) {
  const [counts, setCounts] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const labels = [
    "Số CGĐT",
    "Account Name",
    "IP khách hàng",
    "Thanh lý",
    "Tạm ngưng",
    "Information",
    "Mở Quốc tế",
    "Brandname",
    "Chặn gọi ra"
  ];

  const endpoints = [
    "lech_tocdo",
    "lech_acc_name",
    "lech_destination",
    "lech_thanh_ly",
    "lech_tam_ngung",
    "lech_acc_info",
    "lech_mo_qte",
    "lech_brandname",
    "lech_address_incoming"
  ];

  // 🔹 Fetch counts từ API
  useEffect(() => {
    Promise.all(
      endpoints.map((ep) =>
        fetch(`${API_URL}/doi-soat/count/${ep}/`)
          .then((res) => (res.ok ? res.json() : { count: 0 }))
          .then((data) => data.count ?? 0)
          .catch(() => 0)
      )
    ).then(setCounts);
  }, []);

  // 🔹 Mapping gốc
  const rawData = labels.map((name, i) => ({
    name,
    value: counts[i] || 0,
    apiKey: [
      "ds_tocdo",
      "ds_accname",
      "ds_dest",
      "ds_thanhly",
      "ds_tamngung",
      "ds_info",
      "ds_qte",
      "ds_brand",
      "ds_addincome"
    ][i]
  }));

  // 🔹 Gộp nhóm <5% thành "Khác"
  const total = rawData.reduce((sum, d) => sum + (d.value || 0), 0);
  const mainGroups = rawData.filter((d) => d.value / total >= 0.03);
  const smallGroups = rawData.filter((d) => d.value / total < 0.03);
  const otherSum = smallGroups.reduce((sum, d) => sum + d.value, 0);

  const data = otherSum > 0
    ? [...mainGroups, { name: "Khác", value: otherSum, apiKey: smallGroups.map(d => d.apiKey) }]
    : mainGroups;

  return (
    <div style={{ width: "100%", height: "50vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="75%"
          activeIndex={activeIndex ?? undefined}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
          onClick={(_, index) => {
            if (typeof onClickBox === "function") onClickBox(data[index].apiKey);
          }}
          label={({ percent, name }) => `${name} ${(percent * 100).toFixed(1)}%`}
          labelLine={true} // nếu muốn đường nối
        >
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
