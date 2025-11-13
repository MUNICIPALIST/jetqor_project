import type { InvoiceProductDetails } from "../types";
import { defineStore } from "pinia";
import { ref } from "vue";
import { invoiceService } from "../services/invoiceService";

export const useDetailedProductsStore = defineStore("detailedProducts", () => {
  const products = ref<InvoiceProductDetails[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProducts(invoiceId: number) {
    isLoading.value = true;
    error.value = null;
    try {
      products.value = await invoiceService.getInvoiceProducts(invoiceId);
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch products";
      console.error("Error fetching detailed products:", e);
    }
    finally {
      isLoading.value = false;
    }
  }

  function clearProducts() {
    products.value = [];
    error.value = null;
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    clearProducts,
  };
});
