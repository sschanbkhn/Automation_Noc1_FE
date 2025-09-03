// src/config/platformUsecases.js

// 👉 Đặt nhãn hiển thị cho từng usecase
export const USECASE_LABEL = {
  causecode: "CauseCode",
  kpi: "KPI",
  // thêm usecase mới thì bổ sung label ở đây
};

// 👉 Luật ghép platform ↔ usecase (ưu tiên luật đầu khớp)
export const PLATFORM_USECASE_RULES = [
  // Ví dụ: mọi platform chứa "pgw" (không phân biệt hoa thường)
  { match: /pgw/i, usecases: ["causecode", "kpi"] },
  { match: /pcrf/i, usecases: ["causecode", "kpi"] },
  // Ví dụ mẫu khác (bạn có thể bật dùng khi cần):
  // { match: /ims_sbg/i, usecases: ["kpi"] },
  // { match: /^dra$/i, usecases: ["causecode"] },
  // { match: /hss|hlr/i, usecases: [] }, // không hỗ trợ usecase nào
];

/* ==========================================
 * Helpers
 * ========================================== */
export function getUsecaseTypesForPlatform(platform) {
  if (!platform) return [];
  const rule = PLATFORM_USECASE_RULES.find((r) =>
    r.match instanceof RegExp ? r.match.test(platform) : r.match === platform
  );
  return rule?.usecases || [];
}

export function getUsecaseOptionsForPlatform(platform) {
  return getUsecaseTypesForPlatform(platform).map((v) => ({
    value: v,
    label: USECASE_LABEL[v] || v.toUpperCase(),
  }));
}

export function isUsecaseAllowed(platform, usecaseType) {
  return getUsecaseTypesForPlatform(platform).includes(usecaseType);
}
