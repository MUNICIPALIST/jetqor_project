/**
 * Пользователь системы
 */
export interface User {
  id: number;
  created_at: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  kaspi_key?: string;
  entities: any[];
  products: any[];
  invoices: any[];
}

export type Role = "administrator" | "manager" | "client";
