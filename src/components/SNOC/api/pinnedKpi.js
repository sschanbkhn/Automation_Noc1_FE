import axios from "./snocApiWithAutoToken";

export async function fetchPinnedKpis({ group, subsystem, platform, device, scopes = "all" }) {
  const params = { group, scopes };
  if (subsystem) params.subsystem = subsystem;
  if (platform) params.platform = platform;
  if (device) params.device = device;
  const { data } = await axios.get("/nornirps/pinned-kpis/", { params });
  return data;
}

export async function createPinnedKpi(payload) {
  // payload: { group, subsystem?, platform?, device?, kpi_key, title?, chart_config? }
  const { data } = await axios.post("/nornirps/pinned-kpis/", payload);
  return data;
}

export async function deletePinnedKpi(id) {
  await axios.delete(`/nornirps/pinned-kpis/${id}/`);
  return true;
}

export async function updatePinnedKpi(id, patch) {
  const { data } = await axios.patch(`/nornirps/pinned-kpis/${id}/`, patch);
  return data;
}
