// src/components/SNOC/views/dashboard/DashOrigin/SystemHealthDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import useScheduleWebSocket from "../../../hooks/useScheduleWebSocket";
import {
  fetchPlatformGroupSchema,
  fetchPSCoreStatus,
  fetchSystemStatus,
  fetchSystemStatusByGroup, // 🔄 refresh group
} from "../../../redux/Healthcheck/healthcheckSlice";
import HealthcheckTable from "../../tables/health/HealthcheckTable";
import styles from "./../../../styles/SystemHealth.module.scss";
import TopNavbarHealth from "./TopNavbarHealth";

// ====== HẰNG SỐ / SELECTOR ỔN ĐỊNH ======
const NOK_BAR_COLOR = "#dc3545"; // bootstrap danger red

const statusColorClass = {
  Normal: "success",
  Warning: "warning",
  Error: "danger",
  Unknown: "secondary",
};

const statusIcon = {
  Normal: <span className={`${styles.dot} ${styles.successDot}`} />,
  Warning: <span className={`${styles.dot} ${styles.warningDot}`} />,
  Error: <span className={`${styles.dot} ${styles.dangerDot}`} />,
  Unknown: <span className={`${styles.dot} ${styles.secondaryDot}`} />,
};

const cardClassMapping = {
  "CS Core": styles.cardCsCore,
  "PS Core": styles.cardPsCore,
  Signal: styles.cardSignal,
  OCS: styles.cardOcs,
  "IMS Core": styles.cardIms,
  "UDC Core": styles.cardUdc,
};

const EMPTY_OBJ = Object.freeze({});

const selectSystemStatus = (s) => s.pscore?.systemStatus ?? EMPTY_OBJ;
const selectLoading = (s) => s.pscore?.loading ?? false;
const selectPlatformSchema = (s) => s.pscore?.platformSchema ?? EMPTY_OBJ;
const selectRecentlyUpdated = (s) => s.pscore?.recentlyUpdated ?? EMPTY_OBJ;
const selectSystemLastUpdated = (s) =>
  s.pscore?.last_updated ?? s.pscore?.systemStatus?.last_updated ?? null;

// ====== UTILS ======
const slug = (s = "") =>
  s.toString().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");

// Drag helpers (Group)
const LS_ORDER_KEY = "hc_group_order";
const normalizeOrder = (stored, names) => {
  const set = new Set(names);
  const base = Array.isArray(stored) ? stored.filter((g) => set.has(g)) : [];
  const missing = names.filter((g) => !base.includes(g));
  return [...base, ...missing];
};

// Drag helpers (Subsystem)
const LS_SUB_ORDER_PREFIX = "hc_sub_order:"; // + slug(group)
const getSubOrderKey = (groupName) =>
  `${LS_SUB_ORDER_PREFIX}${slug(groupName)}`;
const normalizeSubOrder = (stored, subNames) => {
  const set = new Set(subNames);
  const base = Array.isArray(stored) ? stored.filter((s) => set.has(s)) : [];
  const missing = subNames.filter((s) => !base.includes(s));
  return [...base, ...missing];
};

// Build series NOK theo giờ (24h)
const buildHourlySeries = (items) => {
  const now = new Date();
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    hours.push(d);
  }
  const key = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:00`;

  const bucket = new Map(hours.map((d) => [key(d), 0]));

  (items || []).forEach((it) => {
    if (!it?.starttime) return;
    const t = new Date(it.starttime);
    if (isNaN(t.getTime())) return;
    const h = new Date(t);
    h.setMinutes(0, 0, 0);
    const k = key(h);
    const isNok = it.status === "NOK" || it.status === "Error";
    if (isNok && bucket.has(k)) bucket.set(k, bucket.get(k) + 1);
  });

  return hours.map((d) => ({
    hour: key(d).slice(11, 16), // HH:00
    nok: bucket.get(key(d)) || 0,
  }));
};

// ====== Chart ngoài dashboard (theo group) ======
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const GroupNokChart = ({
  platformList = [],
  storeKey,
  height = 160,
  title,
}) => {
  const dispatch = useDispatch();

  const byKeyItems = useSelector((s) => s.pscore?.hourlyByKey?.[storeKey]);
  const byKeyLoading = useSelector(
    (s) => s.pscore?.hourlyLoadingByKey?.[storeKey]
  );

  const byPlatform = useSelector((s) => s.pscore?.hourlyByPlatform || {});

  const platformKey = useMemo(() => {
    const set = new Set(platformList || []);
    return JSON.stringify(Array.from(set).sort());
  }, [platformList]);

  useEffect(() => {
    if (!platformList || platformList.length === 0 || !storeKey) return;
    dispatch(
      fetchPSCoreStatus({
        platform: platformList,
        page: 1,
        page_size: 1000,
        hours: 24,
        option: "",
        storeKey, // backfill 1 lần, realtime từ WS sẽ merge thêm
      })
    );
  }, [dispatch, platformKey, storeKey, platformList]);

  const items = useMemo(() => {
    const out = [];
    (platformList || []).forEach((p) => {
      const arr = byPlatform[p] || [];
      if (arr.length) out.push(...arr);
    });
    if (byKeyItems?.length) out.push(...byKeyItems);

    const seen = new Set();
    const dedup = [];
    for (const it of out) {
      if (!it?.starttime) continue;
      const d = new Date(it.starttime);
      if (isNaN(d.getTime())) continue;
      d.setMinutes(0, 0, 0); // bucket theo giờ
      const k = `${it.platform}|${it.host}|${d.toISOString()}`;
      if (!seen.has(k)) {
        seen.add(k);
        dedup.push(it);
      }
    }
    return dedup;
  }, [platformList, byPlatform, byKeyItems]);

  const hourlySeries = useMemo(() => buildHourlySeries(items), [items]);

  const hourIndex = useMemo(() => {
    const m = new Map();
    (items || []).forEach((it) => {
      if (!it?.starttime) return;
      const t = new Date(it.starttime);
      if (isNaN(t.getTime())) return;
      const h = new Date(t);
      h.setMinutes(0, 0, 0);
      const label = String(h.getHours()).padStart(2, "0") + ":00";
      const isNok = it.status === "NOK" || it.status === "Error";
      if (!isNok) return;
      if (!m.has(label)) m.set(label, []);
      m.get(label).push(it);
    });
    return m;
  }, [items]);

  const loading = !!byKeyLoading;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const arr = hourIndex.get(label) || [];
    const uniqHosts = Array.from(new Set(arr.map((x) => x.host)));
    const top = uniqHosts.slice(0, 6);
    const more = uniqHosts.length - top.length;

    return (
      <div className="p-2 bg-white border rounded shadow-sm">
        <div>
          <strong>{label}</strong>
        </div>
        <div>NOK: {payload[0]?.value ?? 0}</div>
        {top.map((h) => (
          <div key={h} style={{ fontSize: "0.85rem" }}>
            • {h}
          </div>
        ))}
        {more > 0 && (
          <div style={{ fontSize: "0.85rem" }}>+{more} node nữa…</div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">
          {title || "NOK theo giờ (24h gần nhất)"}
        </small>
        {loading && <Spinner animation="border" size="sm" />}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart
            data={hourlySeries}
            margin={{ top: 4, right: 8, bottom: 12, left: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              dataKey="nok"
              name="NOK"
              stroke={NOK_BAR_COLOR} // tận dụng màu sẵn có
              strokeWidth={2}
              dot={{ r: 3 }} // chấm tại mỗi điểm
              activeDot={{ r: 5 }} // chấm to hơn khi hover
              // type="linear"           // (tuỳ chọn) giữ đường thẳng; bỏ thì mặc định cũng linear
              // connectNulls            // (tuỳ chọn) nối qua điểm null
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 🔹 Format ngày ngắn gọn dd/mm/yy
const formatDateShort = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yy = String(dateObj.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

// 🔹 1 dòng cho tổng thể & group
const renderLastUpdatedOneLine = (dateStr, small = false) => {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffHours = (now - dateObj) / (1000 * 60 * 60);

  const display = `${formatDateShort(dateObj)} ${dateObj.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;

  const textColor = diffHours > 24 ? "text-danger" : "text-muted";
  const fontSize = small ? "0.75rem" : "0.85rem";

  return (
    <span className={textColor} style={{ fontSize }}>
      {display}
    </span>
  );
};

// 🔹 2 dòng cho subsystem
const renderLastUpdatedTwoLines = (dateStr, small = false) => {
  if (!dateStr) return null;
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffHours = (now - dateObj) / (1000 * 60 * 60);

  const textColor = diffHours > 24 ? "text-danger" : "text-muted";
  const fontSize = small ? "0.75rem" : "0.85rem";

  return (
    <div
      className={`d-flex flex-column ${textColor}`}
      style={{ fontSize, lineHeight: "1.1rem" }}
    >
      <span>{formatDateShort(dateObj)}</span>
      <span>
        {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
};

const SystemHealth = () => {
  useScheduleWebSocket();
  const dispatch = useDispatch();
  const location = useLocation();
  const { group: groupParam, subsystem: subParam } = useParams();

  const systemStatus = useSelector(selectSystemStatus);
  const loading = useSelector(selectLoading);
  const platformSchema = useSelector(selectPlatformSchema);
  const recentlyUpdated = useSelector(selectRecentlyUpdated);
  const systemLastUpdated = useSelector(selectSystemLastUpdated);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);

  // group/subsystem hidden (chỉ trên trang hiện tại)
  const [hiddenGroups, setHiddenGroups] = useState(() => new Set());
  const [hiddenSubsMap, setHiddenSubsMap] = useState({}); // { [group]: Set<string> }

  // order group
  const [groupOrder, setGroupOrder] = useState([]);
  const [draggingGroup, setDraggingGroup] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);

  // order subsystem
  const [subOrderMap, setSubOrderMap] = useState({}); // { [group]: string[] }
  const [draggingSub, setDraggingSub] = useState(null); // { group, sub }
  const [dragOverSub, setDragOverSub] = useState(null); // { group, sub }

  useEffect(() => {
    dispatch(fetchPlatformGroupSchema());
    dispatch(fetchSystemStatus());
  }, [dispatch]);

  // Danh sách group từ data
  const groupNames = useMemo(() => {
    const ks = Object.keys(platformSchema || {});
    if (ks.length) return ks;
    return Object.keys(systemStatus || {});
  }, [platformSchema, systemStatus]);

  // ===== Khởi tạo/đồng bộ thứ tự group từ localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ORDER_KEY);
      const stored = raw ? JSON.parse(raw) : [];
      const normalized = normalizeOrder(stored, groupNames);
      setGroupOrder(normalized);
      localStorage.setItem(LS_ORDER_KEY, JSON.stringify(normalized));
    } catch {
      setGroupOrder(groupNames);
    }
  }, [groupNames]);

  // Lưu thứ tự group khi đổi
  useEffect(() => {
    try {
      if (groupOrder?.length)
        localStorage.setItem(LS_ORDER_KEY, JSON.stringify(groupOrder));
    } catch {}
  }, [groupOrder]);

  // ===== Tính map group -> danh sách subsystem hiện có
  const groupSubNamesMap = useMemo(() => {
    const out = {};
    for (const groupName of groupNames) {
      const subsFromSchema = platformSchema[groupName] || {};
      const groupChildren = (systemStatus[groupName] || {}).children || {};
      const subs =
        Object.keys(subsFromSchema).length > 0
          ? Object.keys(subsFromSchema)
          : Object.keys(groupChildren);
      out[groupName] = subs;
    }
    return out;
  }, [groupNames, platformSchema, systemStatus]);

  // ===== Khởi tạo/đồng bộ thứ tự subsystem theo group
  useEffect(() => {
    try {
      const next = {};
      for (const [groupName, subs] of Object.entries(groupSubNamesMap)) {
        const key = getSubOrderKey(groupName);
        const raw = localStorage.getItem(key);
        const stored = raw ? JSON.parse(raw) : [];
        next[groupName] = normalizeSubOrder(stored, subs);
        localStorage.setItem(key, JSON.stringify(next[groupName]));
      }
      setSubOrderMap(next);
    } catch {}
  }, [groupSubNamesMap]);

  const groupPlatformsMap = useMemo(() => {
    const map = {};
    Object.entries(platformSchema || {}).forEach(([groupName, subsystems]) => {
      const set = new Set();
      Object.values(subsystems || {}).forEach((arr) => {
        if (Array.isArray(arr)) arr.forEach((p) => p && set.add(p));
      });
      map[groupName] = Array.from(set).sort();
    });
    return map;
  }, [platformSchema]);

  const handleSubsystemClick = (group, subsystem, platforms) => {
    setSelectedSubsystem({ group, subsystem, platform: platforms || [] });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    dispatch(fetchSystemStatus());
  };

  // 🔗 Solo group/subsystem: ưu tiên param, fallback query
  const soloGroup = useMemo(() => {
    const fromParam = groupParam ? decodeURIComponent(groupParam) : null;
    const fromQuery = new URLSearchParams(location.search).get("group");
    return fromParam || fromQuery || null;
  }, [groupParam, location.search]);

  const soloSubsystem = useMemo(() => {
    const fromParam = subParam ? decodeURIComponent(subParam) : null;
    const fromQuery = new URLSearchParams(location.search).get("subsystem");
    return fromParam || fromQuery || null;
  }, [subParam, location.search]);

  const visibleGroupNames = useMemo(() => {
    const base =
      soloGroup && groupNames.includes(soloGroup) ? [soloGroup] : groupNames;
    return base.filter((g) => !hiddenGroups.has(g));
  }, [groupNames, soloGroup, hiddenGroups]);

  // Áp thứ tự kéo-thả lên danh sách hiển thị
  const orderedVisibleGroups = useMemo(() => {
    const set = new Set(visibleGroupNames);
    const ordered = groupOrder.filter((g) => set.has(g));
    const missing = visibleGroupNames.filter((g) => !ordered.includes(g));
    return [...ordered, ...missing];
  }, [groupOrder, visibleGroupNames]);

  // 🔗 Mở tab mới (group)
  const openGroupInNewTab = (groupName) => {
    const encoded = encodeURIComponent(groupName);
    const targetPath = `/healthcheck/${encoded}`;
    const origin = window.location.origin;
    const basePath = window.location.pathname.replace(/\/$/, "");
    const isHashRouter = (window.location.hash || "").startsWith("#/");
    const absoluteUrl = isHashRouter
      ? `${origin}${basePath}#${targetPath}`
      : `${origin}${targetPath}`;
    window.open(absoluteUrl, "_blank", "noopener,noreferrer");
  };

  // 🔗 Mở tab mới (subsystem) hiển thị trang chi tiết như modal
  const openSubsystemDetailInNewTab = (groupName, subsystemLabel) => {
    const g = encodeURIComponent(groupName);
    const s = encodeURIComponent(subsystemLabel);
    const targetPath = `/healthcheck/${g}/${s}?detail=1`;

    const origin = window.location.origin;
    const basePath = window.location.pathname.replace(/\/$/, "");
    const isHashRouter = (window.location.hash || "").startsWith("#/");

    const absoluteUrl = isHashRouter
      ? `${origin}${basePath}#${targetPath}`
      : `${origin}${targetPath}`;
    window.open(absoluteUrl, "_blank", "noopener,noreferrer");
  };

  // 🔄 Refresh nhanh 1 group (summary + chart 24h)
  const refreshGroup = (groupName) => {
    dispatch(fetchSystemStatusByGroup(groupName));
    const platforms = groupPlatformsMap[groupName] || [];
    if (platforms.length) {
      dispatch(
        fetchPSCoreStatus({
          platform: platforms,
          page: 1,
          page_size: 1000,
          hours: 24,
          option: "",
          storeKey: `hourly_${slug(groupName)}_group`,
        })
      );
    }
  };

  // ✖ Ẩn 1 group
  const hideGroup = (groupName) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      next.add(groupName);
      return next;
    });
  };

  // ✖ Ẩn 1 subsystem
  const hideSubsystem = (groupName, subsystem) => {
    setHiddenSubsMap((prev) => {
      const next = { ...prev };
      const set = new Set(next[groupName] || []);
      set.add(subsystem);
      next[groupName] = set;
      return next;
    });
  };

  // ====== Drag & Drop (Group)
  const onDragStart = (group, e) => {
    setDraggingGroup(group);
    try {
      e.dataTransfer.setData("text/plain", group);
      e.dataTransfer.effectAllowed = "move";
    } catch {}
  };
  const onDragOver = (target, e) => {
    e.preventDefault();
    if (target !== draggingGroup) setDragOverGroup(target);
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {}
  };
  const onDrop = (target, e) => {
    e.preventDefault();
    const source =
      (e.dataTransfer && e.dataTransfer.getData("text/plain")) || draggingGroup;
    if (!source || source === target) {
      setDragOverGroup(null);
      setDraggingGroup(null);
      return;
    }
    setGroupOrder((prev) => {
      const next = prev.filter((g) => g !== source);
      const idx = next.indexOf(target);
      if (idx === -1) next.push(source);
      else next.splice(idx, 0, source);
      return next;
    });
    setDragOverGroup(null);
    setDraggingGroup(null);
  };
  const onDragEnd = () => {
    setDragOverGroup(null);
    setDraggingGroup(null);
  };

  // ====== Drag & Drop (Subsystem)
  const onSubDragStart = (group, sub, e) => {
    setDraggingSub({ group, sub });
    try {
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", JSON.stringify({ group, sub }));
      e.dataTransfer.effectAllowed = "move";
    } catch {}
  };
  const onSubDragOver = (group, targetSub, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      draggingSub &&
      draggingSub.group === group &&
      draggingSub.sub !== targetSub
    ) {
      setDragOverSub({ group, sub: targetSub });
    }
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {}
  };
  const onSubDrop = (group, targetSub, e) => {
    e.preventDefault();
    e.stopPropagation();
    let payload = draggingSub;
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.group && data?.sub) payload = data;
      }
    } catch {}
    if (!payload || payload.group !== group || payload.sub === targetSub) {
      setDragOverSub(null);
      setDraggingSub(null);
      return;
    }
    setSubOrderMap((prev) => {
      const base = prev[group] || groupSubNamesMap[group] || [];
      const next = base.filter((s) => s !== payload.sub);
      const idx = next.indexOf(targetSub);
      if (idx === -1) next.push(payload.sub);
      else next.splice(idx, 0, payload.sub);
      try {
        localStorage.setItem(getSubOrderKey(group), JSON.stringify(next));
      } catch {}
      return { ...prev, [group]: next };
    });
    setDragOverSub(null);
    setDraggingSub(null);
  };
  const onSubDragEnd = (e) => {
    e?.stopPropagation?.();
    setDragOverSub(null);
    setDraggingSub(null);
  };

  // ===== Detail mode: khi có ?detail=1 → render trang chi tiết thay vì danh sách
  const isSubDetail = useMemo(() => {
    const qp = new URLSearchParams(location.search);
    return !!(soloGroup && soloSubsystem && qp.get("detail") === "1");
  }, [soloGroup, soloSubsystem, location.search]);

  const detailPlatforms = useMemo(() => {
    return platformSchema?.[soloGroup]?.[soloSubsystem] || [];
  }, [platformSchema, soloGroup, soloSubsystem]);

  if (isSubDetail) {
    return (
      <>
        <TopNavbarHealth />
        <WebSocketStatusBanner />
        <Alert />
        <div className={styles.container}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 fw-bold fs-4">
              {soloGroup} / {soloSubsystem}
            </h5>
            {systemLastUpdated && (
              <div className="text-end" style={{ fontSize: "0.9rem" }}>
                Last updated: {renderLastUpdatedOneLine(systemLastUpdated)}
              </div>
            )}
          </div>

          {detailPlatforms.length > 0 && (
            <GroupNokChart
              platformList={detailPlatforms}
              storeKey={`hourly_${slug(soloGroup)}_${slug(
                soloSubsystem
              )}_detail`}
              height={220}
              title={`NOK theo giờ (24h): ${soloGroup} / ${soloSubsystem}`}
            />
          )}

          <HealthcheckTable
            group={soloGroup}
            subsystem={soloSubsystem}
            platformList={detailPlatforms}
            hideChart
          />
        </div>
      </>
    );
  }

  // icon buttons: icon-only, không viền, KHÔNG màu (đã dùng styles.iconBtn)
  const iconBtnClass = "p-1 border-0 bg-transparent text-decoration-none"; // (không còn dùng, nhưng giữ nếu nơi khác còn dùng)

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />
      <div className={styles.container}>
        <Row>
          <Col md={12}>
            {/* ✅ Tổng thể 1 dòng */}
            {systemLastUpdated && (
              <div className="text-end mb-2" style={{ fontSize: "0.9rem" }}>
                Last updated: {renderLastUpdatedOneLine(systemLastUpdated)}
              </div>
            )}

            {!loading && orderedVisibleGroups.length === 0 && (
              <Card className="mb-3">
                <Card.Body className="text-muted">
                  Không có dữ liệu hiển thị. Kiểm tra API
                  <code> /systemhealth/schema/</code> và{" "}
                  <code>/systemhealth/</code>.
                </Card.Body>
              </Card>
            )}

            <Row>
              {orderedVisibleGroups.map((groupName) => {
                const groupData = systemStatus[groupName] || {};
                const groupStatus = groupData.status || "Unknown";
                const groupChildren = groupData.children || {};
                const cardClass = cardClassMapping[groupName] || "";

                const subsFromSchema = platformSchema[groupName] || {};
                const subsystems =
                  Object.keys(subsFromSchema).length > 0
                    ? subsFromSchema // { subsystem: [platforms] }
                    : groupChildren; // { subsystem: {status, ...} }

                const groupPlatforms = groupPlatformsMap[groupName] || [];
                const colMd = soloGroup ? 12 : 6;

                const highlightStyle =
                  dragOverGroup === groupName
                    ? { boxShadow: "inset 0 0 0 2px #0d6efd" }
                    : {};

                // ===== Subsystem ordering + filtering (hidden + solo)
                const rawSubNames = Object.keys(subsystems);
                const hiddenSet = hiddenSubsMap[groupName] || new Set();
                const subNamesVisible = rawSubNames.filter(
                  (s) =>
                    !hiddenSet.has(s) &&
                    (!(soloSubsystem && soloGroup === groupName) ||
                      s === soloSubsystem)
                );
                const subOrder = subOrderMap[groupName] || rawSubNames;
                const orderedSubs = (() => {
                  const set = new Set(subNamesVisible);
                  const base = subOrder.filter((s) => set.has(s));
                  const missing = subNamesVisible.filter(
                    (s) => !base.includes(s)
                  );
                  return [...base, ...missing];
                })();

                return (
                  <Col md={colMd} key={groupName} className="mb-4">
                    <Card
                      className={`shadow ${styles.cardCommon} ${cardClass}`}
                      style={highlightStyle}
                      onDragOver={(e) => onDragOver(groupName, e)}
                      onDrop={(e) => onDrop(groupName, e)}
                      onDragEnter={(e) => onDragOver(groupName, e)}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold fs-4">{groupName}</h5>
                            {/* Drag handle (Group) */}
                            {!soloGroup && (
                              <span
                                role="button"
                                title="Kéo để đổi vị trí group"
                                draggable
                                onDragStart={(e) => onDragStart(groupName, e)}
                                onDragEnd={onDragEnd}
                                style={{
                                  cursor: "grab",
                                  userSelect: "none",
                                  fontSize: "1.1rem",
                                  lineHeight: 1,
                                }}
                              >
                                ⠿
                              </span>
                            )}
                          </div>

                          {/* ==== ICON BUTTONS nhóm: 🔄 ↗ ✖ (màu ghi) ==== */}
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              size="sm"
                              className={styles.iconBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                refreshGroup(groupName);
                              }}
                              title="Làm mới group này"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                              >
                                <path d="M21 12a9 9 0 1 1-2.64-6.36l.71-.7a1 1 0 0 1 1.41 1.41l-2.83 2.83a1 1 0 0 1-1.7-.71V5.5a1 1 0 0 1 2 0v1.1A7 7 0 1 0 19 12h2Z" />
                              </svg>
                            </Button>

                            <Button
                              size="sm"
                              className={styles.iconBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                openGroupInNewTab(groupName);
                              }}
                              title="Mở group trong tab mới"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                              >
                                <path d="M7 17a1 1 0 0 1 0-2h8.59L6.29 5.71A1 1 0 0 1 7.71 4.29L17 13.59V5a1 1 0 0 1 2 0v12a1 1 0 0 1-1 1H7Z" />
                              </svg>
                            </Button>

                            <Button
                              size="sm"
                              className={styles.iconBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                hideGroup(groupName);
                              }}
                              title="Ẩn group này"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                              >
                                <path d="M6.7 5.3a1 1 0 0 1 1.4 0L12 9.17l3.9-3.88a1 1 0 1 1 1.41 1.41L13.41 10.6l3.9 3.9a1 1 0 0 1-1.41 1.41L12 12l-3.9 3.9a1 1 0 1 1-1.41-1.41l3.88-3.9-3.88-3.9a1 1 0 0 1 0-1.39Z" />
                              </svg>
                            </Button>

                            {loading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <span
                                className={`${styles.statusBadge} ${
                                  styles[statusColorClass[groupStatus]]
                                }`}
                              >
                                {statusIcon[groupStatus]} {groupStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ✅ Group 1 dòng */}
                        {groupData.last_updated && (
                          <div className="mb-2">
                            Updated:{" "}
                            {renderLastUpdatedOneLine(groupData.last_updated)}
                          </div>
                        )}

                        {/* ✅ Bố cục 2 cột: Trái = Subsystems + Stats, Phải = Chart */}
                        <Row className="g-3 align-items-stretch">
                          {/* LEFT: Subsystems + Stats */}
                          <Col md={9} className="d-flex flex-column">
                            {/* ✅ Danh sách subsystem (kéo-thả + icon NewTab + ✖) */}
                            {!loading && orderedSubs.length > 0 && (
                              <div className="d-flex flex-wrap gap-3 mt-2">
                                {orderedSubs.map((subsystemLabel) => {
                                  const childData =
                                    groupChildren[subsystemLabel] || {};
                                  const childStatus =
                                    childData.status || "Unknown";

                                  const updatedRecently =
                                    recentlyUpdated?.[groupName]?.[
                                      subsystemLabel
                                    ] &&
                                    Date.now() -
                                      recentlyUpdated[groupName][
                                        subsystemLabel
                                      ] <
                                      3000;

                                  const dynamicClass = updatedRecently
                                    ? styles.updated
                                    : "";

                                  const platforms =
                                    subsFromSchema[subsystemLabel] || [];

                                  const subHighlight =
                                    dragOverSub &&
                                    dragOverSub.group === groupName &&
                                    dragOverSub.sub === subsystemLabel
                                      ? {
                                          boxShadow:
                                            "inset 0 0 0 2px rgba(13,110,253,.6)",
                                          borderRadius: 8,
                                        }
                                      : {};

                                  return (
                                    <div
                                      key={subsystemLabel}
                                      className={`${styles.subItem} ${dynamicClass}`}
                                      style={subHighlight}
                                      onClick={() =>
                                        handleSubsystemClick(
                                          groupName,
                                          subsystemLabel,
                                          platforms
                                        )
                                      }
                                      onDragOver={(e) =>
                                        onSubDragOver(
                                          groupName,
                                          subsystemLabel,
                                          e
                                        )
                                      }
                                      onDrop={(e) =>
                                        onSubDrop(groupName, subsystemLabel, e)
                                      }
                                      onDragEnter={(e) =>
                                        onSubDragOver(
                                          groupName,
                                          subsystemLabel,
                                          e
                                        )
                                      }
                                    >
                                      {/* === SubItem content gọn: Header (label + newtab + hide) / Footer (time + drag + counters) === */}
                                      <div className="w-100">
                                        {/* Header: tên subsystem + nút NewTab + nút Ẩn */}
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                          <div className="d-flex align-items-center gap-1">
                                            {statusIcon[childStatus]}
                                            <span className="fw-semibold fs-6">
                                              {subsystemLabel}
                                            </span>
                                          </div>

                                          <div className="d-flex align-items-center gap-1">
                                            {/* New Tab (subsystem) */}
                                            <Button
                                              size="sm"
                                              className={styles.iconBtn}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openSubsystemDetailInNewTab(
                                                  groupName,
                                                  subsystemLabel
                                                );
                                              }}
                                              title="Mở subsystem trong tab mới"
                                            >
                                              <svg
                                                viewBox="0 0 24 24"
                                                width="18"
                                                height="18"
                                                aria-hidden="true"
                                              >
                                                <path d="M7 17a1 1 0 0 1 0-2h8.59L6.29 5.71A1 1 0 0 1 7.71 4.29L17 13.59V5a1 1 0 0 1 2 0v12a1 1 0 0 1-1 1H7Z" />
                                              </svg>
                                            </Button>

                                            {/* Hide (sub) */}
                                            <Button
                                              size="sm"
                                              className={styles.iconBtn}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                hideSubsystem(
                                                  groupName,
                                                  subsystemLabel
                                                );
                                              }}
                                              title="Ẩn subsystem này"
                                            >
                                              <svg
                                                viewBox="0 0 24 24"
                                                width="18"
                                                height="18"
                                                aria-hidden="true"
                                              >
                                                <path d="M6.7 5.3a1 1 0 0 1 1.4 0L12 9.17l3.9-3.88a1 1 0 1 1 1.41 1.41L13.41 10.6l3.9 3.9a1 1 0 0 1-1.41 1.41L12 12l-3.9 3.9a1 1 0 1 1-1.41-1.41l3.88-3.9-3.88-3.9a1 1 0 0 1 0-1.39Z" />
                                              </svg>
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Footer: thời gian (2 dòng) + nút kéo (SVG) + counters */}
                                        <div className={styles.subFooter}>
                                          {/* Trái: ngày (2 dòng) + grip kéo, bám đáy tuyệt đối */}
                                          <div className={styles.timeAndDrag}>
                                            <div className={styles.twoLineTime}>
                                              {childData.last_updated &&
                                                renderLastUpdatedTwoLines(
                                                  childData.last_updated,
                                                  true
                                                )}
                                            </div>

                                            <button
                                              type="button"
                                              aria-label="Kéo để đổi vị trí subsystem"
                                              className={styles.dragBtn}
                                              draggable
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              onDragStart={(e) =>
                                                onSubDragStart(
                                                  groupName,
                                                  subsystemLabel,
                                                  e
                                                )
                                              }
                                              onDragEnd={onSubDragEnd}
                                              title="Kéo để đổi vị trí subsystem"
                                            >
                                              <svg
                                                viewBox="0 0 20 20"
                                                width="20"
                                                height="20"
                                                aria-hidden="true"
                                              >
                                                <circle
                                                  cx="6"
                                                  cy="6"
                                                  r="1.6"
                                                ></circle>
                                                <circle
                                                  cx="6"
                                                  cy="10"
                                                  r="1.6"
                                                ></circle>
                                                <circle
                                                  cx="6"
                                                  cy="14"
                                                  r="1.6"
                                                ></circle>
                                                <circle
                                                  cx="12"
                                                  cy="6"
                                                  r="1.6"
                                                ></circle>
                                                <circle
                                                  cx="12"
                                                  cy="10"
                                                  r="1.6"
                                                ></circle>
                                                <circle
                                                  cx="12"
                                                  cy="14"
                                                  r="1.6"
                                                ></circle>
                                              </svg>
                                            </button>
                                          </div>

                                          {/* Phải: counters giữ nguyên */}
                                          <div className="d-flex gap-2">
                                            <span
                                              className={
                                                childData.ok_count > 0
                                                  ? styles.ok
                                                  : styles.total
                                              }
                                            >
                                              {childData.ok_count || 0}
                                            </span>
                                            <span
                                              className={
                                                childData.nok_count > 0
                                                  ? styles.nok
                                                  : styles.total
                                              }
                                            >
                                              {childData.nok_count || 0}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* ✅ Stats row */}
                            {!loading && (
                              <div className={`${styles.statRow} mt-auto`}>
                                <div
                                  className={
                                    groupData.ok_count > 0
                                      ? styles.ok
                                      : styles.total
                                  }
                                >
                                  {groupData.ok_count > 0 ? "🟢" : "⚪"} OK:{" "}
                                  <strong>{groupData.ok_count || 0}</strong>
                                </div>
                                <div
                                  className={
                                    groupData.nok_count > 0
                                      ? styles.nok
                                      : styles.total
                                  }
                                >
                                  {groupData.nok_count > 0 ? "🔴" : "⚪"} NOK:{" "}
                                  <strong>{groupData.nok_count || 0}</strong>
                                </div>
                                <div className={styles.total}>
                                  {groupData.total_devices > 0 ? "📦" : "⚪"}{" "}
                                  Total:{" "}
                                  <strong>
                                    {groupData.total_devices || 0}
                                  </strong>
                                </div>
                              </div>
                            )}
                          </Col>

                          {/* RIGHT: Chart — chỉ hiện khi có danh sách platform từ schema */}
                          <Col md={3}>
                            {groupPlatforms.length > 0 && (
                              <GroupNokChart
                                platformList={groupPlatforms}
                                storeKey={`hourly_${slug(groupName)}_group`}
                                height={180}
                                title={`NOK theo giờ (24h) — ${groupName}`}
                              />
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>

        {/* ✅ Modal: Chart + Table */}
        {modalVisible && selectedSubsystem && (
          <Modal
            show={modalVisible}
            onHide={handleCloseModal}
            size="xl"
            centered
            dialogClassName={styles.modalWide}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedSubsystem.group} / {selectedSubsystem.subsystem}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
              {selectedSubsystem.platform?.length > 0 && (
                <GroupNokChart
                  platformList={selectedSubsystem.platform}
                  storeKey={`hourly_${slug(selectedSubsystem.group)}_${slug(
                    selectedSubsystem.subsystem
                  )}_modal`}
                  height={220}
                  title={`NOK theo giờ (24h): ${selectedSubsystem.group} / ${selectedSubsystem.subsystem}`}
                />
              )}

              <HealthcheckTable
                group={selectedSubsystem.group}
                subsystem={selectedSubsystem.subsystem}
                platformList={selectedSubsystem.platform || []}
                hideChart
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </>
  );
};

export default SystemHealth;
