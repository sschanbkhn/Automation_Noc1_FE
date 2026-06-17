import axios from "./snocApiWithAutoToken";

export const fetchAllKpiPreferences = () =>
  axios.get("/nornirps/kpi-preferences/").then((r) => r.data);

export const upsertKpiPreference = (platform, data) =>
  axios
    .put(`/nornirps/kpi-preferences/${encodeURIComponent(platform)}/`, data)
    .then((r) => r.data);

export const deleteKpiPreferenceApi = (platform) =>
  axios.delete(`/nornirps/kpi-preferences/${encodeURIComponent(platform)}/`);
