import type { Product } from "~/features/products/types";
import { defineStore } from "pinia";

// Extended product type that includes order-specific data
export interface OrderProductDetails extends Product {
  orderCount: number;
}

interface DistributedProduct {
  product_id: number;
  cell_id: number;
  count: number;
  cell_code?: string;
  cell_name?: string;
}

export const useOrderProductDistributionStore = defineStore("orderProductDistribution", () => {
  const orderProducts = ref<OrderProductDetails[]>([]);
  const productDetails = ref(new Map<number, OrderProductDetails>());
  const distributedProducts = ref<DistributedProduct[]>([]);

  // Count products that have been fully distributed
  const fullyDistributedProductsCount = computed(() => {
    if (!orderProducts.value.length)
      return 0;

    const fullyDistributed = orderProducts.value.filter((product) => {
      const productId = product.id;
      const originalCount = product.orderCount || 0;
      const distributedCount = getTotalDistributedCount(productId);
      return originalCount > 0 && distributedCount >= originalCount;
    });

    return fullyDistributed.length;
  });

  const isAllProductsDistributed = computed(() => {
    if (!orderProducts.value.length)
      return false;
    return fullyDistributedProductsCount.value === orderProducts.value.length;
  });

  // Set the products for the order
  function setOrderProducts(products: OrderProductDetails[]) {
    orderProducts.value = [...products];

    // Create a map of product details for quick lookup
    productDetails.value.clear();
    products.forEach((product) => {
      productDetails.value.set(product.id, product);
    });
  }

  // Add a product to a warehouse cell
  function addProductToCell(productId: number, cellId: number, cellCode: string, cellName: string, count: number) {
    // Check if this product is already in this cell
    const existingProductIndex = distributedProducts.value.findIndex(
      p => p.product_id === productId && p.cell_id === cellId,
    );

    if (existingProductIndex >= 0) {
      // Update existing entry
      distributedProducts.value[existingProductIndex].count += count;
    }
    else {
      // Add new entry
      distributedProducts.value.push({
        product_id: productId,
        cell_id: cellId,
        count,
        cell_code: cellCode,
        cell_name: cellName,
      });
    }
  }

  // Remove a product from a cell
  function removeProductFromCell(productId: number, cellId: number) {
    distributedProducts.value = distributedProducts.value.filter(
      p => !(p.product_id === productId && p.cell_id === cellId),
    );
  }

  // Get all products in a cell
  function getProductsInCell(cellId: number): DistributedProduct[] {
    return distributedProducts.value.filter(p => p.cell_id === cellId);
  }

  // Get total distributed count for a product
  function getTotalDistributedCount(productId: number): number {
    return distributedProducts.value
      .filter(p => p.product_id === productId)
      .reduce((sum, p) => sum + p.count, 0);
  }

  // Get remaining count for a product
  function getRemainingCount(productId: number): number {
    const product = productDetails.value.get(productId);
    if (!product)
      return 0;

    const originalCount = product.orderCount;
    const distributedCount = getTotalDistributedCount(productId);

    return Math.max(0, originalCount - distributedCount);
  }

  // Clear all distribution data
  function clearDistribution() {
    orderProducts.value = [];
    productDetails.value.clear();
    distributedProducts.value = [];
  }

  return {
    orderProducts,
    distributedProducts,
    fullyDistributedProductsCount,
    isAllProductsDistributed,
    setOrderProducts,
    addProductToCell,
    removeProductFromCell,
    getProductsInCell,
    getTotalDistributedCount,
    getRemainingCount,
    clearDistribution,
  };
});
