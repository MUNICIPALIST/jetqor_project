import type { Order } from "../types";

export default function useOrders() {
  const orders = ref<Order[]>([
    {
      id: 1,
      number: "9712400",
      price: "1 900 000 KZT",
      status: "На сборке",
      platform: "WILDBERRIES",
      items: 4,
      deliveryDate: "04.12.1997",
      location: "Алматы",
      customer: "Сергей Сергеевич",
    },
    {
      id: 2,
      number: "9712400",
      price: "1 900 000 KZT",
      status: "Отменен",
      platform: "OZON",
      items: 4,
      deliveryDate: "04.12.1997",
      location: "Алматы",
      customer: "Сергей Сергеевич",
    },
  // ... more mocked orders
  ]);

  return {
    orders,
  };
}
