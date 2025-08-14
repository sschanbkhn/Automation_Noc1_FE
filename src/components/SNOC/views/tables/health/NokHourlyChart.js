import React, { useEffect, useMemo } from "react";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchPSCoreStatus } from "../../../redux/Healthcheck/healthcheckSlice";

const NOK_BAR_COLOR = "#dc3545"; // đỏ danger (NOK)

const NokHourlyChart = ({
  platformList = [],
  hours = 24,
  storeKey, // mỗi chart dùng 1 key riêng trong Redux để không đè nhau
  height = 120,
  compact = true,
  title,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(
    (s) => s.pscore?.hourlyLoadingByKey?.[storeKey] || false
  );
  const items = useSelector((s) => s.pscore?.hourlyByKey?.[storeKey] || []);

  useEffect(() => {
    if (!platformList?.length || !storeKey) return;
    dispatch(
      fetchPSCoreStatus({
        platform: platformList,
        page: 1,
        page_size: 1000,
        hours,
        option: "",
        storeKey,
      })
    );
  }, [dispatch, platformList, hours, storeKey]);

  const data = useMemo(() => {
    const now = new Date();
    const hoursArr = [];
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600 * 1000);
      d.setMinutes(0, 0, 0);
      hoursArr.push(d);
    }
    const key = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:00`;

    const bucket = new Map(hoursArr.map((d) => [key(d), 0]));
    (items || []).forEach((it) => {
      if (!it?.starttime) return;
      const t = new Date(it.starttime);
      t.setMinutes(0, 0, 0);
      const k = key(t);
      const isNok = it.status === "NOK" || it.status === "Error";
      if (isNok && bucket.has(k)) bucket.set(k, (bucket.get(k) || 0) + 1);
    });

    return hoursArr.map((d) => ({
      hour: key(d).slice(11, 16),
      nok: bucket.get(key(d)) || 0,
    }));
  }, [items]);

  return (
    <div>
      {!compact && (
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">{title || "NOK theo giờ (24h)"}</h6>
          {loading && <Spinner animation="border" size="sm" />}
        </div>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            {!compact && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="hour" hide={compact} />
            <YAxis allowDecimals={false} hide={compact} />
            {!compact && <Tooltip />}
            <Bar
              dataKey="nok"
              name="NOK"
              fill={NOK_BAR_COLOR}
              stroke={NOK_BAR_COLOR}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {compact && loading && (
        <div className="text-center mt-1">
          <Spinner animation="border" size="sm" />
        </div>
      )}
    </div>
  );
};

export default NokHourlyChart;
