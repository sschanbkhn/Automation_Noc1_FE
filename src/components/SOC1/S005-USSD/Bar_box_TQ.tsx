import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell
} from "recharts";
import "./index.css";

interface Props {
  onZoneClick: (index: number) => void;
}

export default function BarNgangTQ({ onZoneClick }: Props) {
  const [soLuongChuaChuanHoaMB, setSoLuongChuaChuanHoaMB] =
    useState<number>(0);
  const [soLuongChuaChuanHoaMN, setSoLuongChuaChuanHoaMN] =
    useState<number>(0);
    const COLORS = ["#00cbfeff", "#f1b13aff"]; // Bắc – Nam
  useEffect(() => {
    fetch(`${API_URL}/thong-ke-loi/count/mb/account_be_chua_chuan_hoa/`)
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data) => setSoLuongChuaChuanHoaMB(data.count ?? 0))
      .catch(() => setSoLuongChuaChuanHoaMB(0));

    fetch(`${API_URL}/thong-ke-loi/count/mn/account_be_chua_chuan_hoa/`)
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data) => setSoLuongChuaChuanHoaMN(data.count ?? 0))
      .catch(() => setSoLuongChuaChuanHoaMN(0));
  }, []);

  const data = [
    { region: "Miền Bắc", value: soLuongChuaChuanHoaMB },
    { region: "Miền Nam", value: soLuongChuaChuanHoaMN },
  ];

  return (
    <div style={{ height: "36vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="region"
            tick={{ fontSize: 14 }}
          />
          <Tooltip />

          <Bar
            dataKey="value"
            radius={[0, 10, 10, 0]}
            cursor="pointer"
            onClick={(_, index) => onZoneClick(index)}
            >
            {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}

            <LabelList dataKey="value" position="right" />
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
