import type { Product } from "~/features/products/types";

export type InvoiceType = "incoming" | "consumable" | "internal" | "return";
export type InvoiceStatus = "created" | "approved" | "declined" | "indelivery" | "Выполнен";

export interface InvoiceProductDetails extends Product {
  invoiceCount: number;
  handled: boolean;
  handled_count: number;
}

export interface InvoiceProduct {
  id: number;
  productId: number;
  count: number;
  handled: boolean;
  handled_count: number;
}

export interface MarketplaceInfo {
  type: "wildberries" | "ozon" | "kaspi";
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  status: InvoiceStatus;
  items: number;
  warehouse: string;
  createdAt: string;
  city: string;
  client: string;
  responsible: string;
  marketplace?: MarketplaceInfo;
  address_from?: string;
  address_to?: string;
  products?: InvoiceProduct[];
  storageId?: number;
  decline_message?: string;
}

export interface Shelf {
  id: number;
  label: string;
}

export interface WarehouseCell {
  id: number;
  name: string;
  code: string;
}

export interface WarehouseRow {
  id: number;
  label: string;
  cells: number;
  items: WarehouseCell[];
}

export interface CellLocation {
  id: number;
  name: string;
  code: string;
  warehouse: string;
  shelf: string;
  row: string;
}
