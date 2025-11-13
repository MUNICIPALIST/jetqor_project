export type KaspiOrderStatus
  = | "APPROVED_BY_BANK"
    | "ACCEPTED_BY_MERCHANT"
    | "COMPLETED"
    | "CANCELLED"
    | "CANCELLING"
    | "KASPI_DELIVERY_RETURN_REQUESTED"
    | "RETURNED";

export const KASPI_ORDER_STATUSES: Record<KaspiOrderStatus, string> = {
  APPROVED_BY_BANK: "Одобрен банком",
  ACCEPTED_BY_MERCHANT: "Принят продавцом",
  COMPLETED: "Завершен",
  CANCELLED: "Отменен",
  CANCELLING: "Отменяется",
  KASPI_DELIVERY_RETURN_REQUESTED: "Запрошен возврат",
  RETURNED: "Возвращен",
};

export type OrderStatus
  = | "packaging"
    | "assembly"
    | "packed"
    | "completed"
    | "cancelled"
    | "return_request"
    | "return";

export interface OrderProduct {
  id: number;
  orderId: number;
  productId: number;
  count: number;
}

export interface CreateOrderDto {
  kaspi_code: string;
  total_price: number;
  delivery_cost: number;
  kaspi_status: KaspiOrderStatus;
  customer_phone: string;
  customer_name: string;
  products: OrderProduct[];
}

export interface Order {
  id: number;
  kaspi_code: string;
  wildberries_code: string | null;
  ozon_code: string | null;
  created_at: string;
  updated_at: string;
  marketplace_created_at: string;
  total_price: number;
  delivery_cost: number;
  status: OrderStatus;
  kaspi_status: KaspiOrderStatus;
  customer_phone: string;
  customer_name: string;
  express: boolean;
  products: OrderProduct[];
  userId?: number;
  storage_id?: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    totalOrders?: number;
  };
}

// Эти типы больше не используются в API, они определены в store
