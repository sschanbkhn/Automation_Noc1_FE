// src/components/SNOC/redux/Sbc/sbcConnectionSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// 🔧 Chuẩn hoá payload gửi backend ConnectionConfig (multi Session-Agent)
const sanitizeConnectionPayload = (obj = {}) => {
  const out = {};

  const toInt = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    if (Number.isNaN(n)) return null;
    return n;
  };

  const setInt = (key) => {
    const n = toInt(obj[key]);
    if (n !== null) out[key] = n;
  };

  const setStr = (key, outKey = null) => {
    const v = obj[key];
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    out[outKey || key] = s;
  };

  // FK dạng id trên ConnectionConfig
  setInt("connection_type");
  setInt("realm");
  setInt("service");
  setInt("node");
  setInt("tgrp");
  setInt("prefix_send");
  setInt("prefix_receive");

  // Tên đối tác
  if (obj.partner_name || obj.partner) {
    setStr("partner_name");
    if (!out.partner_name) {
      setStr("partner", "partner_name");
    }
  }

  // 🌟 Nested Session-Agent list (1 SA, nhiều dải RTP)
  if (Array.isArray(obj.session_agents_payload)) {
    out.session_agents_payload = obj.session_agents_payload
      .map((ag) => {
        if (!ag) return null;

        const hostname = String(ag.hostname || "").trim();
        const ip_sip = String(ag.ip_sip || "").trim();
        const subnet_sip = String(ag.subnet_sip || "").trim();
        const max_sessions = toInt(ag.max_sessions);

        // Lấy danh sách dải RTP từ payload mới (rtp_ranges_payload)
        // hoặc fallback sang rtp_ranges (nếu sau này dùng key đó),
        // hoặc cuối cùng là ip_rtp/subnet_rtp cũ (support ngược).
        let rawRanges = [];

        if (Array.isArray(ag.rtp_ranges_payload)) {
          rawRanges = ag.rtp_ranges_payload;
        } else if (Array.isArray(ag.rtp_ranges)) {
          rawRanges = ag.rtp_ranges;
        } else {
          // support kiểu cũ: 1 cặp ip_rtp / subnet_rtp trên SA
          const ip_rtp_old = String(ag.ip_rtp || "").trim();
          const subnet_rtp_old = String(ag.subnet_rtp || "").trim();
          if (ip_rtp_old && subnet_rtp_old) {
            rawRanges = [{ ip_rtp: ip_rtp_old, subnet_rtp: subnet_rtp_old }];
          }
        }

        const rtp_ranges_payload = rawRanges
          .map((r) => {
            if (!r) return null;
            const ip_rtp = String(r.ip_rtp || "").trim();
            const subnet_rtp = String(r.subnet_rtp || "").trim();
            if (!ip_rtp || !subnet_rtp) return null;
            return { ip_rtp, subnet_rtp };
          })
          .filter(Boolean);

        // Bắt buộc đủ field cơ bản + ít nhất 1 dải RTP hợp lệ
        if (
          !hostname ||
          !ip_sip ||
          !subnet_sip ||
          !max_sessions ||
          !rtp_ranges_payload.length
        ) {
          return null;
        }

        return {
          hostname,
          ip_sip,
          subnet_sip,
          max_sessions,
          rtp_ranges_payload,
        };
      })
      .filter(Boolean);
  }

  return out;
};

// 🔧 Chuẩn hoá payload gửi backend RoutingRule
const sanitizeRoutingRulePayload = (obj = {}) => {
  const out = {};

  const toInt = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    if (Number.isNaN(n)) return null;
    return n;
  };

  out.source_connection = toInt(obj.source_connection);
  out.service = toInt(obj.service);
  out.country_destination = toInt(obj.country_destination);

  if (obj.note !== undefined && obj.note !== null) {
    out.note = String(obj.note).trim();
  }

  if (Array.isArray(obj.choices_payload)) {
    out.choices_payload = obj.choices_payload
      .map((choice) => {
        if (!choice) return null;
        const ratio = toInt(choice.ratio);
        if (!ratio) return null;

        const name = String(choice.name || "").trim();

        const hops_clean = (choice.hops || [])
          .map((h) => {
            const tgrp = toInt(h.tgrp);
            const priority = toInt(h.priority) || 1;
            if (!tgrp) return null;
            return { tgrp, priority };
          })
          .filter(Boolean);

        if (!hops_clean.length) return null;

        return {
          ratio,
          name,
          hops: hops_clean,
        };
      })
      .filter(Boolean);
  }

  return out;
};

// ===================== OPTIONS (bảng phụ) =====================

// ===== THÊM VÀO ĐẦU FILE (sau các import cũ) =====

export const addCountryDestinationQuick = createAsyncThunk(
  "sbcConnection/addCountryDestinationQuick",
  async ({ country_name, destination_code }, { rejectWithValue, dispatch }) => {
    try {
      const name = String(country_name || "").trim();
      const code = String(destination_code || "").trim();

      if (!name || !code) {
        return rejectWithValue("CountryName và Destination Code không hợp lệ");
      }

      const res = await snocApi.post("/nornirps/sbc/countries/", {
        country_name: name,
        destination_code: code,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Country/Dest: ${name} (${code})`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        "Không thể tạo Country/Destination mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchRoutingRules = createAsyncThunk(
  "sbcConnection/fetchRoutingRules",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/sbc/routing-rules/");
      const data = Array.isArray(res.data?.results)
        ? res.data.results
        : res.data;
      return data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Không thể tải danh sách định tuyến lưu lượng";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addRoutingRule = createAsyncThunk(
  "sbcConnection/addRoutingRule",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const body = sanitizeRoutingRulePayload(formData);
      await snocApi.post("/nornirps/sbc/routing-rules/", body);

      dispatch(
        showTemporaryAlert({
          message: "Khai báo định tuyến thành công",
          type: "success",
        })
      );
      dispatch(fetchRoutingRules());
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        JSON.stringify(error?.response?.data || {}) ||
        "Không thể khai báo định tuyến";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateRoutingRule = createAsyncThunk(
  "sbcConnection/updateRoutingRule",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const body = sanitizeRoutingRulePayload(data);
      await snocApi.put(`/nornirps/sbc/routing-rules/${id}/`, body);

      dispatch(
        showTemporaryAlert({
          message: "Cập nhật định tuyến thành công",
          type: "success",
        })
      );
      dispatch(fetchRoutingRules());
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        JSON.stringify(error?.response?.data || {}) ||
        "Không thể cập nhật định tuyến";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteRoutingRule = createAsyncThunk(
  "sbcConnection/deleteRoutingRule",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`/nornirps/sbc/routing-rules/${id}/`);

      dispatch(
        showTemporaryAlert({
          message: "Đã xoá định tuyến",
          type: "success",
        })
      );
      dispatch(fetchRoutingRules());
      return true;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Không thể xoá định tuyến";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ===================== SERVICE PREFIX (Đầu số dịch vụ) =====================

export const fetchServicePrefixes = createAsyncThunk(
  "sbcConnection/fetchServicePrefixes",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/sbc/service-prefixes/");
      const data = Array.isArray(res.data?.results)
        ? res.data.results
        : res.data;
      return data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Không thể tải danh sách đầu số dịch vụ";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addServicePrefix = createAsyncThunk(
  "sbcConnection/addServicePrefix",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const body = {
        connection: payload.connection ? Number(payload.connection) : null,
        service: payload.service ? Number(payload.service) : null,
        prefix: String(payload.prefix || "").trim(),
        route_code: String(
          payload.route_code || payload.routeCode || ""
        ).trim(),
        note: payload.note ?? "",
      };

      const res = await snocApi.post("/nornirps/sbc/service-prefixes/", body);

      dispatch(
        showTemporaryAlert({
          message: `Đã khai báo đầu số ${body.prefix} thành công`,
          type: "success",
        })
      );

      // Reload danh sách
      dispatch(fetchServicePrefixes());

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể khai báo đầu số dịch vụ";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateServicePrefix = createAsyncThunk(
  "sbcConnection/updateServicePrefix",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const body = {
        connection: data.connection ? Number(data.connection) : null,
        service: data.service ? Number(data.service) : null,
        prefix: String(data.prefix || "").trim(),
        route_code: String(data.route_code || data.routeCode || "").trim(),
        note: data.note ?? "",
      };

      const res = await snocApi.put(
        `/nornirps/sbc/service-prefixes/${id}/`,
        body
      );

      dispatch(
        showTemporaryAlert({
          message: `Đã cập nhật đầu số ${body.prefix}`,
          type: "success",
        })
      );

      dispatch(fetchServicePrefixes());
      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể cập nhật đầu số dịch vụ";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteServicePrefix = createAsyncThunk(
  "sbcConnection/deleteServicePrefix",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`/nornirps/sbc/service-prefixes/${id}/`);

      dispatch(
        showTemporaryAlert({
          message: "Đã xoá đầu số dịch vụ",
          type: "success",
        })
      );

      dispatch(fetchServicePrefixes());
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể xoá đầu số dịch vụ";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ===== QUICK ADD PARTNER GROUP (VIP1, VIP2...) =====
export const addPartnerGroupQuick = createAsyncThunk(
  "sbcConnection/addPartnerGroupQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên nhóm VIP không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/partner-groups/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo nhóm VIP: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.name?.[0] ||
        "Không thể tạo nhóm VIP mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ===== QUICK ADD PARTNER (Viettel, Mobifone...) =====
export const addPartnerQuick = createAsyncThunk(
  "sbcConnection/addPartnerQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên nhà mạng không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/partners/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo nhà mạng: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.name?.[0] ||
        "Không thể tạo nhà mạng mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchPartnerGroups = createAsyncThunk(
  "sbcConnection/fetchPartnerGroups",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/sbc/partner-groups/");
      return Array.isArray(res.data?.results) ? res.data.results : res.data;
    } catch (error) {
      const msg = "Không thể tải danh sách nhóm VIP";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchPartners = createAsyncThunk(
  "sbcConnection/fetchPartners",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/sbc/partners/");
      return Array.isArray(res.data?.results) ? res.data.results : res.data;
    } catch (error) {
      const msg = "Không thể tải danh sách nhà mạng";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);
export const assignPartnerPairs = createAsyncThunk(
  "sbcConnection/assignPartnerPairs",
  async ({ configId, pairs }, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.patch(`/nornirps/sbc/connection-configs/${configId}/`, {
        partner_pairs_payload: pairs, // ← gửi đúng tên field
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã gán ${pairs.length} cặp VIP - Nhà mạng`,
          type: "success",
        })
      );
      dispatch(fetchConnectionConfigs());
      return true;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Không thể gán cặp đối tác";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchSbcOptions = createAsyncThunk(
  "sbcConnection/fetchSbcOptions",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const [
        typesRes,
        realmsRes,
        servicesRes,
        nodesRes,
        sessionAgentsRes,
        tgrpsRes,
        prefixSendsRes,
        prefixReceivesRes,
        countriesRes, // 🔥 THÊM
      ] = await Promise.all([
        snocApi.get("/nornirps/sbc/connection-types/"),
        snocApi.get("/nornirps/sbc/realms/"),
        snocApi.get("/nornirps/sbc/services/"),
        snocApi.get("/nornirps/sbc/nodes/"),
        snocApi.get("/nornirps/sbc/session-agents/"),
        snocApi.get("/nornirps/sbc/tgrps/"),
        snocApi.get("/nornirps/sbc/prefix-sends/"),
        snocApi.get("/nornirps/sbc/prefix-receives/"),
        snocApi.get("/nornirps/sbc/countries/"), // 🔥 THÊM
      ]);

      const norm = (res) =>
        Array.isArray(res.data?.results) ? res.data.results : res.data;

      return {
        connectionTypes: norm(typesRes),
        realms: norm(realmsRes),
        services: norm(servicesRes),
        nodes: norm(nodesRes),
        sessionAgents: norm(sessionAgentsRes),
        tgrps: norm(tgrpsRes),
        prefixSends: norm(prefixSendsRes),
        prefixReceives: norm(prefixReceivesRes),
        countries: norm(countriesRes), // 🔥 THÊM
      };
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Không thể tải danh mục SBC (ConnectionType/Realm/Service/Node/SessionAgent/TGRP/Prefix)";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ====== Quick create cho các bảng phụ ======

export const addConnectionTypeQuick = createAsyncThunk(
  "sbcConnection/addConnectionTypeQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên Connection Type không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/connection-types/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Connection Type: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Connection Type mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addRealmQuick = createAsyncThunk(
  "sbcConnection/addRealmQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên Realm không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/realms/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Realm: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Realm mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addServiceQuick = createAsyncThunk(
  "sbcConnection/addServiceQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên Service không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/services/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Service: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Service mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addNodeQuick = createAsyncThunk(
  "sbcConnection/addNodeQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên Node không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/nodes/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Node: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Node mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addSessionAgentQuick = createAsyncThunk(
  "sbcConnection/addSessionAgentQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên Session Agent không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/session-agents/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Session Agent: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Session Agent mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addTgrpQuick = createAsyncThunk(
  "sbcConnection/addTgrpQuick",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(name || "").trim();
      if (!trimmed) return rejectWithValue("Tên TGRP không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/tgrps/", {
        name: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo TGRP: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo TGRP mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addPrefixSendQuick = createAsyncThunk(
  "sbcConnection/addPrefixSendQuick",
  async (value, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(value || "").trim();
      if (!trimmed) return rejectWithValue("Prefix gửi không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/prefix-sends/", {
        value: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Prefix gửi: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Prefix gửi mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addPrefixReceiveQuick = createAsyncThunk(
  "sbcConnection/addPrefixReceiveQuick",
  async (value, { rejectWithValue, dispatch }) => {
    try {
      const trimmed = String(value || "").trim();
      if (!trimmed) return rejectWithValue("Prefix nhận không hợp lệ");

      const res = await snocApi.post("/nornirps/sbc/prefix-receives/", {
        value: trimmed,
      });

      dispatch(
        showTemporaryAlert({
          message: `Đã tạo Prefix nhận: ${trimmed}`,
          type: "success",
        })
      );

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo Prefix nhận mới";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ===================== CONNECTION CONFIG =====================

export const fetchConnectionConfigs = createAsyncThunk(
  "sbcConnection/fetchConnectionConfigs",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/sbc/connection-configs/");
      const data = Array.isArray(res.data?.results)
        ? res.data.results
        : res.data;
      return data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Không thể tải danh sách cấu hình kết nối SBC";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addConnectionConfig = createAsyncThunk(
  "sbcConnection/addConnectionConfig",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const body = sanitizeConnectionPayload(formData);
      await snocApi.post("/nornirps/sbc/connection-configs/", body);

      dispatch(
        showTemporaryAlert({
          message: "Tạo kết nối SBC thành công",
          type: "success",
        })
      );
      // 🔁 Reload danh sách
      dispatch(fetchConnectionConfigs());
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo kết nối SBC";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateConnectionConfig = createAsyncThunk(
  "sbcConnection/updateConnectionConfig",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const body = sanitizeConnectionPayload(data);
      await snocApi.put(`/nornirps/sbc/connection-configs/${id}/`, body);

      dispatch(
        showTemporaryAlert({
          message: "Cập nhật cấu hình kết nối SBC thành công",
          type: "success",
        })
      );
      // 🔁 Reload danh sách
      dispatch(fetchConnectionConfigs());
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể cập nhật cấu hình kết nối SBC";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteConnectionConfig = createAsyncThunk(
  "sbcConnection/deleteConnectionConfig",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`/nornirps/sbc/connection-configs/${id}/`);

      dispatch(
        showTemporaryAlert({
          message: "Đã xoá cấu hình kết nối SBC",
          type: "success",
        })
      );
      // 🔁 Reload danh sách
      dispatch(fetchConnectionConfigs());
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể xoá cấu hình kết nối SBC";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ===================== SLICE =====================

const sbcConnectionSlice = createSlice({
  name: "sbcConnection",
  initialState: {
    // danh mục
    connectionTypes: [],
    services: [],
    realms: [],
    nodes: [],
    sessionAgents: [],
    tgrps: [],
    prefixSends: [],
    prefixReceives: [],
    countries: [], // 🔥 THÊM
    loadingOptions: false,

    // danh sách ConnectionConfig
    configs: [],
    loadingConfigs: false,

    // ⭐ Đầu số dịch vụ
    servicePrefixes: [],
    loadingServicePrefixes: false,
    // Routing
    routingRules: [], // 🔥 THÊM
    loadingRouting: false, // 🔥 THÊM

    submitting: false,
    partnerGroups: [],
    partners: [],
    loadingPartners: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchSbcOptions
    builder
      .addCase(fetchSbcOptions.pending, (state) => {
        state.loadingOptions = true;
      })
      .addCase(fetchSbcOptions.fulfilled, (state, action) => {
        state.loadingOptions = false;
        state.connectionTypes = action.payload.connectionTypes || [];
        state.services = action.payload.services || [];
        state.realms = action.payload.realms || [];
        state.nodes = action.payload.nodes || [];
        state.sessionAgents = action.payload.sessionAgents || [];
        state.tgrps = action.payload.tgrps || [];
        state.prefixSends = action.payload.prefixSends || [];
        state.prefixReceives = action.payload.prefixReceives || [];
        state.countries = action.payload.countries || []; // 🔥 THÊM
      })
      .addCase(fetchSbcOptions.rejected, (state) => {
        state.loadingOptions = false;
      });

    // fetchConnectionConfigs
    builder
      .addCase(fetchConnectionConfigs.pending, (state) => {
        state.loadingConfigs = true;
      })
      .addCase(fetchConnectionConfigs.fulfilled, (state, action) => {
        state.loadingConfigs = false;
        state.configs = action.payload || [];
      })
      .addCase(fetchConnectionConfigs.rejected, (state) => {
        state.loadingConfigs = false;
      });

    // submit
    builder
      .addCase(addConnectionConfig.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addConnectionConfig.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(addConnectionConfig.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(updateConnectionConfig.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateConnectionConfig.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateConnectionConfig.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(deleteConnectionConfig.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteConnectionConfig.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(deleteConnectionConfig.rejected, (state) => {
        state.submitting = false;
      });

    // push nhanh các option mới vào state
    builder.addCase(addConnectionTypeQuick.fulfilled, (state, action) => {
      if (action.payload) state.connectionTypes.push(action.payload);
    });
    builder.addCase(addRealmQuick.fulfilled, (state, action) => {
      if (action.payload) state.realms.push(action.payload);
    });
    builder.addCase(addServiceQuick.fulfilled, (state, action) => {
      if (action.payload) state.services.push(action.payload);
    });
    builder.addCase(addNodeQuick.fulfilled, (state, action) => {
      if (action.payload) state.nodes.push(action.payload);
    });
    builder.addCase(addSessionAgentQuick.fulfilled, (state, action) => {
      if (action.payload) state.sessionAgents.push(action.payload);
    });
    builder.addCase(addTgrpQuick.fulfilled, (state, action) => {
      if (action.payload) state.tgrps.push(action.payload);
    });
    builder.addCase(addPrefixSendQuick.fulfilled, (state, action) => {
      if (action.payload) state.prefixSends.push(action.payload);
    });
    builder.addCase(addPrefixReceiveQuick.fulfilled, (state, action) => {
      if (action.payload) state.prefixReceives.push(action.payload);
    });
    builder.addCase(addCountryDestinationQuick.fulfilled, (state, action) => {
      if (action.payload) state.countries.push(action.payload);
    });
    // ===== PARTNER GROUPS & PARTNERS =====
    builder
      .addCase(fetchPartnerGroups.pending, (state) => {
        state.loadingPartners = true;
      })
      .addCase(fetchPartnerGroups.fulfilled, (state, action) => {
        state.loadingPartners = false;
        state.partnerGroups = action.payload || [];
      })
      .addCase(fetchPartnerGroups.rejected, (state) => {
        state.loadingPartners = false;
      })

      .addCase(fetchPartners.pending, (state) => {
        state.loadingPartners = true;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.loadingPartners = false;
        state.partners = action.payload || [];
      })
      .addCase(fetchPartners.rejected, (state) => {
        state.loadingPartners = false;
      })

      .addCase(assignPartnerPairs.pending, (state) => {
        state.submitting = true;
      })
      .addCase(assignPartnerPairs.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(assignPartnerPairs.rejected, (state) => {
        state.submitting = false;
      });
    // Push nhanh vào state khi tạo mới
    builder
      .addCase(addPartnerGroupQuick.fulfilled, (state, action) => {
        if (action.payload) state.partnerGroups.push(action.payload);
      })
      .addCase(addPartnerQuick.fulfilled, (state, action) => {
        if (action.payload) state.partners.push(action.payload);
      });

    // ===================== SERVICE PREFIXES =====================
    builder
      .addCase(fetchServicePrefixes.pending, (state) => {
        state.loadingServicePrefixes = true;
      })
      .addCase(fetchServicePrefixes.fulfilled, (state, action) => {
        state.loadingServicePrefixes = false;
        state.servicePrefixes = action.payload || [];
      })
      .addCase(fetchServicePrefixes.rejected, (state) => {
        state.loadingServicePrefixes = false;
      })
      .addCase(addServicePrefix.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addServicePrefix.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(addServicePrefix.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(updateServicePrefix.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateServicePrefix.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateServicePrefix.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(deleteServicePrefix.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteServicePrefix.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(deleteServicePrefix.rejected, (state) => {
        state.submitting = false;
      });
    // fetchRoutingRules
    builder
      .addCase(fetchRoutingRules.pending, (state) => {
        state.loadingRouting = true;
      })
      .addCase(fetchRoutingRules.fulfilled, (state, action) => {
        state.loadingRouting = false;
        state.routingRules = action.payload || [];
      })
      .addCase(fetchRoutingRules.rejected, (state) => {
        state.loadingRouting = false;
      });

    // add / update / delete dùng chung submitting
    builder
      .addCase(addRoutingRule.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addRoutingRule.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(addRoutingRule.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(updateRoutingRule.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateRoutingRule.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateRoutingRule.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(deleteRoutingRule.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteRoutingRule.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(deleteRoutingRule.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export default sbcConnectionSlice.reducer;
