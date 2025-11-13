import type { CreateClientInvoiceDto } from "../types/client";
import api from "~/plugins/api";

export const clientInvoiceService = {
  async create(data: CreateClientInvoiceDto) {
    return await api("/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        storageId: data.storageId,
        type: data.type || "incoming", // Default to incoming if not specified
        products: data.products.map(p => ({
          count: p.count.toString(), // API ожидает строку
          productId: p.productId.toString(), // API ожидает строку
        })),
      },
    });
  },
};
