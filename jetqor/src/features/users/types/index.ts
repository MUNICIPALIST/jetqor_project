export type UserRole = "administrator" | "manager" | "client";

export interface User {
  id: number;
  created_at: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  blocked: boolean;
  kaspi_key: string | null;
  wildberries_key: string | null;
  ozon_key: string | null;
  products: Product[];
  invoices: Invoice[];
  initiated_notifications: any[]; // TODO: Add proper type when needed
  notifications: any[]; // TODO: Add proper type when needed
}

interface Product {
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
  price: number;
  integration_kaspi: boolean;
  integration_wildberries: boolean;
  integration_ozon: boolean;
  best_seller: boolean;
  width: number;
  height: number;
  length: number;
  volume: number;
  weight: number;
}

interface Invoice {
  id: number;
  created_at: string;
  updated_at: string;
  type: "incoming" | "outgoing";
  status: "created" | "approved";
  ownerId: number;
  storageId: number;
}
