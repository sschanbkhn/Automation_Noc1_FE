import axios from "../utils/axios"; // dùng instance có sẵn auth/csrf của bạn

export async function fetchPinnedKpis({ group, subsystem, platform, device, scopes = "all" }) {
  const params = { group, scopes };
  if (subsystem) params.subsystem = subsystem;
  if (platform) params.platform = platform;
  if (device) params.device = device;
  const { data } = await axios.get("/api/nornirps/pinned-kpis/", { params });
  return data;
}

export async function createPinnedKpi(payload) {
  // payload: { group, subsystem?, platform?, device?, kpi_key, title?, chart_config? }
  const { data } = await axios.post("/api/nornirps/pinned-kpis/", payload);
  return data;
}

export async function deletePinnedKpi(id) {
  await axios.delete(`/api/nornirps/pinned-kpis/${id}/`);
  return true;
}

export async function updatePinnedKpi(id, patch) {
  const { data } = await axios.patch(`/api/nornirps/pinned-kpis/${id}/`, patch);
  return data;
}
