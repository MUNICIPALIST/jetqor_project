import type { ClientSelectedProduct } from "../types/client";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useClientInvoiceStore = defineStore("clientInvoice", () => {
  const selectedProducts = ref<ClientSelectedProduct[]>([]);
  const selectedStorageId = ref<number | null>(null);

  const totalProducts = computed(() => selectedProducts.value.length);
  const totalCount = computed(() =>
    selectedProducts.value.reduce((sum, product) => sum + product.count, 0),
  );
  const totalPrice = computed(() =>
    selectedProducts.value.reduce((sum, product) => sum + (product.price * product.count), 0),
  );

  function addProduct(product: ClientSelectedProduct) {
    const existingProduct = selectedProducts.value.find(p => p.productId === product.productId);
    if (existingProduct) {
      existingProduct.count += product.count;
    }
    else {
      selectedProducts.value.push(product);
    }
  }

  function removeProduct(productId: number) {
    const index = selectedProducts.value.findIndex(p => p.productId === productId);
    if (index !== -1) {
      selectedProducts.value.splice(index, 1);
    }
  }

  function updateProductCount(productId: number, count: number) {
    const product = selectedProducts.value.find(p => p.productId === productId);
    if (product) {
      product.count = count;
    }
  }

  function setStorageId(id: number) {
    selectedStorageId.value = id;
  }

  function reset() {
    selectedProducts.value = [];
    selectedStorageId.value = null;
  }

  return {
    selectedProducts,
    selectedStorageId,
    totalProducts,
    totalCount,
    totalPrice,
    addProduct,
    removeProduct,
    updateProductCount,
    setStorageId,
    reset,
  };
});
