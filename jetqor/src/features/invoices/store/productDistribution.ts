import type { InvoiceProductDetails } from "../types";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface DistributedProduct {
  product_id: number; // This represents the id from InvoiceProduct
  cell_id: number;
  cell_code: string; // For better display
  cell_name: string; // For better display
  count: number;
}

export const useProductDistributionStore = defineStore("productDistribution", () => {
  // State
  const distributedProducts = ref<DistributedProduct[]>([]);
  const invoiceProducts = ref<InvoiceProductDetails[]>([]);

  // Getters
  const getProductsInCell = computed(() => (cellId: number) => {
    return distributedProducts.value.filter(p => p.cell_id === cellId);
  });

  const getTotalDistributedCount = computed(() => (productId: number) => {
    return distributedProducts.value
      .filter(p => p.product_id === productId)
      .reduce((sum, item) => sum + item.count, 0);
  });

  const getAllInvoiceProductIds = computed(() => {
    return invoiceProducts.value.map(p => p.id);
  });

  const getDistributedProductIds = computed(() => {
    return [...new Set(distributedProducts.value.map(p => p.product_id))];
  });

  const getFullyDistributedProductIds = computed(() => {
    return invoiceProducts.value
      .filter((product) => {
        const distributedCount = getTotalDistributedCount.value(product.id);
        return distributedCount >= product.invoiceCount;
      })
      .map(p => p.id);
  });

  const fullyDistributedProductsCount = computed(() => {
    return getFullyDistributedProductIds.value.length;
  });

  const getUndistributedProductIds = computed(() => {
    const allIds = getAllInvoiceProductIds.value;
    const distributedIds = getDistributedProductIds.value;
    return allIds.filter((id) => {
      const product = invoiceProducts.value.find(p => p.id === id);
      const distributedCount = getTotalDistributedCount.value(id);
      return !product || distributedCount < product.invoiceCount;
    });
  });

  const isAllProductsDistributed = computed(() => {
    // Check if all products are fully distributed
    return invoiceProducts.value.every((product) => {
      const distributedCount = getTotalDistributedCount.value(product.id);
      return distributedCount >= product.invoiceCount;
    });
  });

  const getRemainingCount = computed(() => (productId: number) => {
    const product = invoiceProducts.value.find(p => p.id === productId);
    if (!product)
      return 0;

    const distributedCount = getTotalDistributedCount.value(productId);
    return Math.max(0, product.invoiceCount - distributedCount);
  });

  // Actions
  function setInvoiceProducts(products: InvoiceProductDetails[]) {
    invoiceProducts.value = products;
  }

  function addDistributedProducts(cellId: number, cellCode: string, cellName: string, products: Record<number, number>) {
    // Convert the products object to array of distributed products
    Object.entries(products).forEach(([productId, count]) => {
      const productIdNum = Number(productId);
      if (count <= 0)
        return;

      // Check if this product is already in this cell
      const existingIndex = distributedProducts.value.findIndex(
        p => p.product_id === productIdNum && p.cell_id === cellId,
      );

      if (existingIndex >= 0) {
        // Update existing record - MERGE quantities
        distributedProducts.value[existingIndex].count += count;
      }
      else {
        // Add new record
        distributedProducts.value.push({
          product_id: productIdNum, // Using the correct ID from the invoice product
          cell_id: cellId,
          cell_code: cellCode,
          cell_name: cellName,
          count,
        });
      }
    });
  }

  function removeProductFromCell(productId: number, cellId: number) {
    const index = distributedProducts.value.findIndex(
      p => p.product_id === productId && p.cell_id === cellId,
    );

    if (index >= 0) {
      distributedProducts.value.splice(index, 1);
    }
  }

  function clearDistribution() {
    distributedProducts.value = [];
  }

  return {
    distributedProducts,
    invoiceProducts,
    getProductsInCell,
    getTotalDistributedCount,
    getRemainingCount,
    isAllProductsDistributed,
    getUndistributedProductIds,
    getFullyDistributedProductIds,
    fullyDistributedProductsCount,
    setInvoiceProducts,
    addDistributedProducts,
    removeProductFromCell,
    clearDistribution,
  };
});
