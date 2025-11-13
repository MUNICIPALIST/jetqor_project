import type { Order as APIOrder } from "../types";

export interface ComponentOrder {
  id: number;
  number: string;
  price: string;
  status: string;
  platform: string;
  items: number;
  deliveryDate: string;
  location: string;
  customer: string;
  express: boolean;
}

export function adaptOrder(order: APIOrder): ComponentOrder {
  return {
    id: order.id,
    number: order.kaspi_code,
    price: `${order.total_price} KZT`,
    status: order.status, // Используем внутренний статус вместо kaspi_status
    platform: "kaspi", // Так как заказы только из Kaspi
    items: order.products.length,
    deliveryDate: new Date(order.created_at).toLocaleDateString(),
    location: "Казахстан", // Локация по умолчанию
    customer: order.customer_name,
    express: order.express,
  };
}

export function adaptOrders(orders: APIOrder[]): ComponentOrder[] {
  return orders.map(adaptOrder);
}
