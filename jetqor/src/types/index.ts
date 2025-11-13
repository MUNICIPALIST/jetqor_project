// types/index.ts
export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface ChartData {
  revenue: number;
  profit: number;
  year: number | string;
}

export interface TabOption {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  article: string;
  photo_url: string;
  description: string;
  sells_count_month: number;
  last_sell_dt: string | null;
  created_at: string;
  updated_at: string;
  userId: number;
}

export interface User {
  id: number;
  created_at: string;
  email: string;
  name: string;
  phone: string;
  role: "administrator" | "manager" | "client";
  kaspi_key?: string;
  wildberries_key?: string;
  ozon_key?: string;
  entities: any[]; // TODO: type this when entities structure is known
  products: Product[];
  invoices: any[]; // TODO: type this when invoice structure is known
  kaspi_key: string;
  wildberries_key: any;
  ozon_key: any;
  storage_id: any;
  blocked: boolean;
}
