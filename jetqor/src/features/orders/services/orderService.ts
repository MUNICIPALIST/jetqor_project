import type { CreateOrderDto, Order, OrdersResponse, OrderStatus } from "../types";
import { useUserStore } from "~/features/user/stores/user";
import api from "~/plugins/api";

export const orderService = {
  async create(data: CreateOrderDto): Promise<Order> {
    return await api("/order/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: data,
    });
  },

  async getMyOrders(params: {
    page?: number;
    size?: number;
    status?: OrderStatus | "all";
    expressFilter?: "all" | "express" | "regular";
  } = {}): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();

    if (params.page)
      searchParams.append("page", params.page.toString());
    if (params.size)
      searchParams.append("size", params.size.toString());
    if (params.status && params.status !== "all")
      searchParams.append("status", params.status);
    if (params.expressFilter && params.expressFilter !== "all") {
      searchParams.append("expressFilter", params.expressFilter === "express" ? "true" : "false");
    }

    const url = `/order/my${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    return await api(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async getOrderById(id: number | string): Promise<Order> {
    return await api(`/order/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async updateOrderStatus(id: number | string, status: string): Promise<Order> {
    return await api(`/order/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: String(id),
        status,
      },
    });
  },

  async approveOrderAssembly(id: number | string, products: any[]): Promise<Order> {
    // Make sure we're sending the correct format
    const requestData = {
      id: String(id),
      products,
    };

    return await api(`/order/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: requestData,
    });
  },

  async downloadInvoice(orderId: number | string): Promise<Blob> {
    return await api(`/order/${orderId}/invoice/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob",
    });
  },

  async quickApproveAndDownload(orderId: number | string, products: any[]): Promise<Blob> {
    // Сначала одобряем сборку заказа
    await this.approveOrderAssembly(orderId, products);

    // Ожидаем обновления статуса в Kaspi
    console.warn("Ожидаем 5 секунд для обновления статуса заказа в Kaspi...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Затем скачиваем накладную
    // return await this.downloadInvoice(orderId);

    // Временно возвращаем пустой blob
    return new Blob();
  },

  async bulkApproveAndDownload(orderIds: (number | string)[]): Promise<Blob> {
    // Массовое одобрение и скачивание накладных для нескольких заказов
    return await api(`/order/bulk/approve-and-download`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        orderIds: orderIds.map(id => String(id)),
      },
      responseType: "blob",
    });
  },

  async notifyInvoicePacked(orderId: number | string): Promise<void> {
    // Уведомление о том, что заказ упакован
    return await api(`/order/packed`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: String(orderId),
      },
    });
  },

  // === New: link-based consignment download by Kaspi code ===
  async getConsignmentLink(kaspiCode: number | string): Promise<string> {
    // Using query param as in cURL; backend expects Kaspi order code as identifier
    const kaspi_key = useUserStore().user?.kaspi_key ?? "";
    if (!kaspi_key)
      throw new Error("Нет API ключа Kaspi. Укажите его в настройках > API.");

    console.warn("Fetching consignment link for Kaspi code:", kaspiCode);
    // Note: keeping query name as orderId but passing Kaspi code value, per backend contract clarification
    const res = await api<string | { url?: string }>(`/api/Orders/getconsignment?orderId=${encodeURIComponent(String(kaspiCode))}`, {
      method: "POST",
      headers: {
        "X-Auth-Token": kaspi_key,
      },
    });

    if (typeof res === "string")
      return res;
    if (res && typeof res === "object" && res.url)
      return res.url;
    throw new Error("Не удалось получить ссылку накладной");
  },

  async bulkGetConsignmentLinks(kaspiCodes: (number | string)[]): Promise<{ kaspiCode: string; url?: string; error?: unknown }[]> {
    const results = await Promise.allSettled(
      kaspiCodes.map(code => this.getConsignmentLink(code)),
    );
    return results.map((r, idx) => {
      const kaspiCode = String(kaspiCodes[idx]);
      if (r.status === "fulfilled")
        return { kaspiCode, url: r.value };
      return { kaspiCode, error: r.reason };
    });
  },

  async approveAndGetConsignmentLink(orderId: number | string, kaspiCode: number | string, products: any[]): Promise<string> {
    // Approve assembly first by internal order id, then get link by Kaspi code
    await this.approveOrderAssembly(orderId, products);

    // Ожидаем обновления статуса в Kaspi перед получением ссылки
    console.warn("Ожидаем 5 секунд для обновления статуса заказа в Kaspi...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    return await this.getConsignmentLink(kaspiCode);
  },
};
