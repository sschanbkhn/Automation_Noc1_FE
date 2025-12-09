export type ModuleStatus = "active" | "maintenance";
export type SortDirection = "asc" | "desc";

export interface ApiError {
  message: string;
  status?: number;
}

export interface ConfigModule {
  id: number;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  status: ModuleStatus;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface ArchiveFilters {
  startDate: string;
  endDate: string;
  province: string;
  district: string;
  vendor: string;
}

export interface DropdownOptions {
  provinces: string[];
  districts: string[];
  vendors: string[];
}
