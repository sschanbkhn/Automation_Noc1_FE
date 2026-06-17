import React, { useMemo } from "react";
import { Badge, Button, Form, Offcanvas, Spinner } from "react-bootstrap";
import Select from "react-select";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const DEFAULT_PREFS = { group: null, sub: null, platforms: null, show_chart: true };

const HealthDashPersonalize = ({ show, onHide, schema, prefs, onChange }) => {
  // Normalize: guard against old localStorage string format bleeding through before schema migration runs
  const safeGroup = Array.isArray(prefs.group) ? prefs.group : prefs.group ? [prefs.group] : null;
  const safeSub   = Array.isArray(prefs.sub)   ? prefs.sub   : prefs.sub   ? [prefs.sub]   : null;
  const safePrefs = safeGroup !== prefs.group || safeSub !== prefs.sub
    ? { ...prefs, group: safeGroup, sub: safeSub }
    : prefs;

  // ── Build dropdown options ──────────────────────────────────────────
  const groupOptions = useMemo(
    () => Object.keys(schema || {}).map((g) => ({ value: g, label: g })),
    [schema],
  );

  // Subsystem options cascade from selected groups (array).
  // Deduplicate theo sub name để tránh react-select highlight nhầm nhiều option.
  const subsystemOptions = useMemo(() => {
    const sourceGroups = safePrefs.group?.length
      ? safePrefs.group
      : Object.keys(schema || {});
    const seen = new Set();
    return sourceGroups.flatMap((g) =>
      Object.keys((schema || {})[g] || {})
        .filter((s) => {
          if (seen.has(s)) return false;
          seen.add(s);
          return true;
        })
        .map((s) => ({ value: s, label: s })),
    );
  }, [schema, safePrefs.group]);

  // Platform options cascade từ selected groups + subs (cả hai là array)
  const platformOptions = useMemo(() => {
    const sourceGroups = safePrefs.group?.length
      ? safePrefs.group
      : Object.keys(schema || {});
    return sourceGroups.flatMap((g) => {
      const subs = (schema || {})[g] || {};
      const sourceSubs = safePrefs.sub?.length
        ? Object.keys(subs).filter((s) => safePrefs.sub.includes(s))
        : Object.keys(subs);
      return sourceSubs
        .map((s) => ({
          label: `${g} / ${s}`,
          options: (subs[s] || []).map((p) => ({ value: p, label: p })),
        }))
        .filter((grp) => grp.options.length > 0);
    });
  }, [schema, safePrefs.group, safePrefs.sub]);

  const activeFilterCount = [
    (safePrefs.group?.length ?? 0) > 0,
    (safePrefs.sub?.length ?? 0) > 0,
    (safePrefs.platforms?.length ?? 0) > 0,
    !safePrefs.show_chart,
  ].filter(Boolean).length;

  // ── Handlers ────────────────────────────────────────────────────────
  const handleGroupChange = (selected) => {
    const groups = selected?.length ? selected.map((o) => o.value) : null;
    // Giữ lại subs còn thuộc ít nhất 1 group đã chọn
    const validSub =
      groups?.length && safePrefs.sub?.length
        ? safePrefs.sub.filter((s) =>
            groups.some((g) =>
              Object.keys((schema || {})[g] || {}).includes(s),
            ),
          )
        : safePrefs.sub;
    // Giữ lại platforms còn thuộc ít nhất 1 group đã chọn
    const validPlatforms =
      groups?.length && safePrefs.platforms
        ? safePrefs.platforms.filter((p) =>
            groups.some((g) =>
              Object.values((schema || {})[g] || {}).flat().includes(p),
            ),
          )
        : safePrefs.platforms;
    onChange({
      ...safePrefs,
      group: groups,
      sub: validSub?.length ? validSub : null,
      platforms: validPlatforms?.length ? validPlatforms : null,
    });
  };

  const handleSubChange = (selected) => {
    const subs = selected?.length ? selected.map((o) => o.value) : null;
    const sourceGroups = safePrefs.group?.length
      ? safePrefs.group
      : Object.keys(schema || {});
    // Giữ lại platforms còn thuộc ít nhất 1 sub đã chọn
    const validPlatforms =
      subs?.length && safePrefs.platforms
        ? safePrefs.platforms.filter((p) =>
            sourceGroups.some((g) =>
              subs.some((s) => ((schema || {})[g]?.[s] || []).includes(p)),
            ),
          )
        : safePrefs.platforms;
    onChange({
      ...safePrefs,
      sub: subs,
      platforms: validPlatforms?.length ? validPlatforms : null,
    });
  };

  const handlePlatformChange = (selected) => {
    onChange({
      ...safePrefs,
      platforms: selected?.length ? selected.map((o) => o.value) : null,
    });
  };

  const handleReset = () => onChange(DEFAULT_PREFS);

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: 420 }}>
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title className="fs-6 fw-bold">
          ⚙ Tuỳ chỉnh hiển thị
          {activeFilterCount > 0 && (
            <Badge bg="primary" className="ms-2">
              {activeFilterCount} bộ lọc
            </Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column gap-4" style={{ overflowY: "visible" }}>
        {/* Loading state khi schema chưa sẵn sàng */}
        {Object.keys(schema || {}).length === 0 && (
          <div className="text-center text-muted py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Đang tải danh sách platform...
          </div>
        )}

        {/* Group filter — single select */}
        <div>
          <Form.Label className="fw-semibold mb-1" style={{ fontSize: "0.85rem" }}>
            Nhóm hiển thị
          </Form.Label>
          <div style={{ fontSize: "0.75rem", color: "#6c757d", marginBottom: 4 }}>
            Để trống = hiện tất cả nhóm
          </div>
          <Select
            isMulti
            closeMenuOnSelect={false}
            placeholder="Chọn nhóm..."
            options={groupOptions}
            value={safePrefs.group?.length ? safePrefs.group.map((g) => ({ value: g, label: g })) : null}
            onChange={handleGroupChange}
            styles={SELECT_STYLES}
            noOptionsMessage={() => "Không tìm thấy nhóm"}
          />
        </div>

        {/* Subsystem filter — single select, cascade from group */}
        <div>
          <Form.Label className="fw-semibold mb-1" style={{ fontSize: "0.85rem" }}>
            Subsystem hiển thị
          </Form.Label>
          <div style={{ fontSize: "0.75rem", color: "#6c757d", marginBottom: 4 }}>
            {safePrefs.group?.length === 1
              ? `Options thuộc nhóm "${safePrefs.group[0]}" — để trống = hiện tất cả`
              : safePrefs.group?.length > 1
                ? `Options thuộc ${safePrefs.group.length} nhóm đã chọn — để trống = hiện tất cả`
                : "Để trống = hiện tất cả subsystem"}
          </div>
          <Select
            isMulti
            closeMenuOnSelect={false}
            placeholder="Chọn subsystem..."
            options={subsystemOptions}
            value={safePrefs.sub?.length ? safePrefs.sub.map((s) => ({ value: s, label: s })) : null}
            onChange={handleSubChange}
            styles={SELECT_STYLES}
            noOptionsMessage={() =>
              Object.keys(schema || {}).length === 0
                ? "Đang tải danh sách..."
                : "Không tìm thấy subsystem"
            }
          />
        </div>

        {/* Platform filter — multi select */}
        <div>
          <Form.Label className="fw-semibold mb-1" style={{ fontSize: "0.85rem" }}>
            Platform hiển thị
          </Form.Label>
          <div style={{ fontSize: "0.75rem", color: "#6c757d", marginBottom: 4 }}>
            Để trống = hiện tất cả platform
          </div>
          <Select
            isMulti
            closeMenuOnSelect={false}
            placeholder="Chọn platform..."
            options={platformOptions}
            value={
              safePrefs.platforms
                ? safePrefs.platforms.map((p) => ({ value: p, label: p }))
                : null
            }
            onChange={handlePlatformChange}
            styles={SELECT_STYLES}
            noOptionsMessage={() => {
              if (Object.keys(schema || {}).length === 0) return "Đang tải danh sách...";
              if (safePrefs.sub?.length) return `Không có platform cho subsystem "${safePrefs.sub.join(", ")}"`;
              return "Không tìm thấy platform";
            }}
          />
        </div>

        {/* Chart toggle */}
        <div className="border-top pt-3">
          <Form.Check
            type="switch"
            id="pref-show-chart"
            label={
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Hiển thị đồ thị NOK trong dashboard
              </span>
            }
            checked={safePrefs.show_chart !== false}
            onChange={(e) => onChange({ ...safePrefs, show_chart: e.target.checked })}
          />
          <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: 2 }}>
            Tắt để ẩn biểu đồ NOK theo giờ trên mỗi group card
          </div>
        </div>

        {/* Reset */}
        <div className="mt-auto border-top pt-3">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleReset}
            disabled={activeFilterCount === 0}
          >
            Đặt lại mặc định
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default HealthDashPersonalize;
