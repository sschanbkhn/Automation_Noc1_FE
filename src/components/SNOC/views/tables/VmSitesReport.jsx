// =============================
// File: VmSitesReport.jsx
// =============================
import React, { useEffect, useState } from "react";

// Simple component: read an HTML report file (same folder) and render its table
// Usage: <VmSitesReport src={new URL("./vm_sites_report.html", import.meta.url).toString()} />
// Assumes table columns: Name | Host | Site | UUID | Instance Name | Status

function parseRows(htmlText) {
  const doc = new DOMParser().parseFromString(htmlText, "text/html");
  let table = doc.querySelector("#vmTable");
  if (!table) {
    const all = Array.from(doc.querySelectorAll("table"));
    table = all.find((t) => t.querySelectorAll("tr").length > 0) || null;
  }
  if (!table) return [];

  const tbody = table.querySelector("tbody") || table;
  const trs = Array.from(tbody.querySelectorAll("tr"));

  // Try to infer header indices if thead exists
  const headerCells = Array.from(table.querySelectorAll("thead th"));
  const headerMap = {};
  const norm = (s) => (s || "").trim().toLowerCase();
  headerCells.forEach((th, i) => {
    const t = norm(th.textContent);
    if (t.includes("name") && headerMap.name === undefined) headerMap.name = i;
    if (t.includes("host")) headerMap.host = i;
    if (t.includes("site")) headerMap.site = i;
    if (t.includes("uuid")) headerMap.uuid = i;
    if (t.includes("instance")) headerMap.instance = i;
    if (t.includes("status")) headerMap.status = i;
  });

  return trs
    .map((tr) => {
      const tds = tr.querySelectorAll("td");
      if (!tds.length) return null;
      const pick = (key, fallbackIdx) => {
        const idx = headerMap[key] !== undefined ? headerMap[key] : fallbackIdx;
        return idx != null ? (tds[idx]?.textContent || "").trim() : "";
      };
      return {
        name: pick("name", 0),
        host: pick("host", 1),
        site: pick("site", 2),
        uuid: pick("uuid", 3),
        instance: pick("instance", 4),
        status: pick("status", 5),
      };
    })
    .filter(Boolean);
}

export default function VmSitesReport({ src }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!src) throw new Error("Missing src for vm_sites_report.html");
        setLoading(true);
        const res = await fetch(src, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        const parsed = parseRows(txt);
        if (!cancelled) setRows(parsed);
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 12 }}>OpenStack VM Report</h3>

      {loading && <div style={{ color: "#666" }}>Đang tải dữ liệu…</div>}
      {error && (
        <div style={{ color: "#c00", marginBottom: 8 }}>
          Không tải được file: <code>{String(error)}</code>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #eee",
            borderRadius: 8,
          }}
        >
          <table
            style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
          >
            <thead style={{ background: "#f6f6f6" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                <th style={{ textAlign: "left", padding: 8 }}>Host</th>
                <th style={{ textAlign: "left", padding: 8 }}>Site</th>
                <th style={{ textAlign: "left", padding: 8 }}>UUID</th>
                <th style={{ textAlign: "left", padding: 8 }}>Instance Name</th>
                <th style={{ textAlign: "left", padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.uuid}-${i}`}
                  style={{ background: i % 2 ? "#fff" : "#fafafa" }}
                >
                  <td style={{ padding: 8, fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: 8 }}>{r.host}</td>
                  <td style={{ padding: 8 }}>{r.site}</td>
                  <td style={{ padding: 8, fontFamily: "monospace" }}>
                    {r.uuid}
                  </td>
                  <td style={{ padding: 8 }}>{r.instance}</td>
                  <td style={{ padding: 8 }}>{r.status}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} style={{ padding: 16, color: "#888" }}>
                    Không tìm thấy bảng trong file HTML.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
