// KPIs
export interface DashboardKPIs {
  total_sold: number;
  total_reservations: number;
  avg_ticket: number;
  total_profit?: number;
}

// Charts
export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardCharts {
  sales: ChartPoint[];
  profit?: ChartPoint[];
}

//Tables
export interface SellerRow {
  name: string;
  total: number;
  reservations: number;
}

export interface CustomerRow {
  name: string;
  total: number;
  reservations: number;
}

export interface DashboardTables {
  customers: CustomerRow[];
  sellers?: SellerRow[];
}

// Response
export interface GetDashboardResponse {
  mode: "admin" | "seller";
  kpis: DashboardKPIs;
  charts: DashboardCharts;
  tables: DashboardTables;
}
