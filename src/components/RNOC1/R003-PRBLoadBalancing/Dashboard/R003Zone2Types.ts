// src/components/R003-PRBLoadBalancing/R003Zone2Types.ts

/**
 * =============================================================================
 * R003 ZONE 2 - TYPE DEFINITIONS
 * =============================================================================
 * Chứa tất cả types/interfaces dùng chung cho Zone 2 Trend Analysis
 */

// =============================================================================
// LEVEL TYPES
// =============================================================================

export type LevelType = "network" | "province" | "district";

// =============================================================================
// API RESPONSE TYPES - Trend Data
// =============================================================================

/*
export interface TrendDataItem {
  date: string; // "2025-10-09"
  congestedCells: number; // 265
  processingCells: number; // 80
  existingCells: number; // 192
  blacklistCells: number; // 185
  resolvedCells: number; // 10
  totalCells: number; // 12402
  successRate?: number; // 83.3 (optional vì có thể không có)
}

*/

export interface TrendDataItem {
  date: string;
  congestedCells: number;
  processingCells: number;
  existingCells: number;
  blacklistCells: number;
  resolvedCells: number;
  newCells: number; // ← THÊM
  totalCells: number;
  successRate?: number;
}

export interface TrendApiResponse {
  success: boolean;
  data: TrendDataItem[];
}

// =============================================================================
// API RESPONSE TYPES - Province/District Data
// =============================================================================

export interface ProvinceItem {
  provinceCode: string; // "HN", "HCM", "DN"...
  congestedCells: number;
  processingCells: number;
  existingCells: number;
  blacklistCells: number;
  resolvedCells: number;
  newCells: number;
  totalCells: number;
  congestionRate?: number; // % cells nghẽn
}

export interface DistrictItem {
  districtCode: string; // "HK", "DD", "BD"...
  provinceCode: string; // "HN"
  congestedCells: number;
  processingCells: number;
  existingCells: number;
  blacklistCells: number;
  resolvedCells: number;
  newCells: number;
  totalCells: number;
  congestionRate?: number;
}

export interface ProvincesApiResponse {
  success: boolean;
  date: string;
  totalProvinces: number;
  data: ProvinceItem[];
}

export interface DistrictsApiResponse {
  success: boolean;
  date: string;
  provinceCode?: string;
  totalDistricts: number;
  data: DistrictItem[];
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface BaseChartProps {
  selectedDate: string; // "2025-10-22"
  level: LevelType; // 'network' | 'province' | 'district'
  provinceCode?: string; // "HN" (khi level = province/district)
  districtCode?: string; // "HK" (khi level = district)
  selectedChart?: string; // ← THÊM DÒNG NÀY
  height?: number; // Default: 400px
}

// Props cho Main component
export interface Zone2MainProps {
  selectedDate: string; // Từ parent component truyền xuống
}

// =============================================================================
// STATE TYPES
// =============================================================================

export interface ChartState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// =============================================================================
// RECHARTS CUSTOM TYPES (nếu cần)
// =============================================================================

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

/*
GIẢI THÍCH:
1. Level Types:

LevelType - 3 options: network, province, district

2. API Response Types:

TrendDataItem - 1 ngày data (từ API trend-network/province/district)
TrendApiResponse - Response wrapper
ProvinceItem/DistrictItem - Data cho comparison charts
ProvincesApiResponse/DistrictsApiResponse - Response wrappers

3. Component Props:

BaseChartProps - Props chung cho 10 charts
Zone2MainProps - Props cho main container

4. State Types:

ChartState < T > - Generic type cho loading/error state

*/

/*

CƠ BẢN:
TypeScript là gì?

TypeScript = JavaScript + Types
Compiler: TypeScript → JavaScript (browser chỉ hiểu JS)
Mục đích: Phát hiện lỗi sớm, code an toàn hơn

.ts vs .tsx:
.ts(TypeScript file)
  .tsx(TypeScript + JSX file)
  .js(JavaScript file)
  .jsx(JavaScript + JSX file)

  JSX = JavaScript XML
Định nghĩa:
JSX cho phép viết HTML bên trong JavaScript

*/
