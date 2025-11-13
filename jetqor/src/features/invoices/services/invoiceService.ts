import type { Invoice, InvoiceProduct, InvoiceProductDetails } from "../types";
import type { Product } from "~/features/products/types";
import api from "~/plugins/api";

export interface ProductDistribution {
  product_id: number;
  cell_id: number;
  count: number;
}

export const invoiceService = {
  async getInvoiceById(invoiceId: number): Promise<Invoice> {
    return api<Invoice>(`/invoice/id/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async declineInvoice(invoiceId: number | string, declineMessage: string): Promise<Invoice> {
    return api<Invoice>("/invoice/decline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: Number(invoiceId),
        decline_message: declineMessage,
      },
    });
  },

  async getProductById(productId: number): Promise<Product> {
    return api<Product>(`/product/id/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async getInvoiceProducts(invoiceId: number): Promise<InvoiceProductDetails[]> {
    const invoice = await this.getInvoiceById(invoiceId);

    if (!invoice.products || invoice.products.length === 0) {
      return [];
    }

    const productPromises = invoice.products.map(async (product) => {
      try {
        const productDetails = await this.getProductById(product.productId);
        return {
          ...productDetails,
          // Use the invoice product's ID for product_id in distribution
          id: product.id, // This is the ID we'll use for distribution
          invoiceCount: product.count,
          handled: product.handled,
          handled_count: product.handled_count,
        };
      }
      catch (error) {
        console.error(`Error fetching product ${product.productId}:`, error);
        return null;
      }
    });

    const products = await Promise.all(productPromises);
    return products.filter((p): p is InvoiceProductDetails => p !== null);
  },

  // Функция для сохранения распределения товаров по ячейкам
  async saveProductDistribution(invoiceId: number, cellId: number, productDistribution: Record<number, number>) {
    // Здесь будет код для отправки данных на сервер
    console.log("Saving distribution for invoice", invoiceId, "cell", cellId, "products", productDistribution);
  },

  // Функция для подтверждения распределения товаров накладной
  async approveProductDistribution(invoiceId: number | string, products: ProductDistribution[]) {
    try {
      // Make sure we're sending the correct format
      const requestData = {
        id: String(invoiceId),
        products,
      };
      const result = await api("/invoice/approve", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return result;
    }
    catch (error) {
      console.error("Error approving product distribution:", error);
      throw error;
    }
  },
};
