import { defineStore } from "pinia";
import { useProductsQuery } from "../queries/products";
import type { Pagination, Product } from "../types";

export const useProductsStore = defineStore("products", () => {
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    refresh: refreshProducts,
    refetch: refetchProducts,
    error: errorProducts,
  } = useProductsQuery();

  // Extract products and pagination from the new response format
  const products = computed<Product[]>(() => productsResponse.value?.products || []);
  const pagination = computed<Pagination | null>(() => productsResponse.value?.pagination || null);

  // Get total pages from pagination data instead of using fixed value
  const totalPages = computed(() => pagination.value?.totalPages || 1);
  const totalProducts = computed(() => pagination.value?.totalProducts || 0);

  const selectedTab = ref("all");
  const tabOptions = [
    { label: "Все", value: "all" },
    { label: "Топ-100 продаж", value: "top" },
    { label: "Просроченные", value: "expired" },
  ];

  const route = useRoute();
  const selectedProductId = computed(() => route.params?.id as string);
  const currentProduct = computed(() => {
    if (!selectedProductId.value || !products.value)
      return null;
    return products.value.find(product => product.id === Number(selectedProductId.value));
  });

  return {
    products,
    pagination,
    isLoadingProducts,
    refreshProducts,
    refetchProducts,
    errorProducts,
    currentProduct,
    selectedTab,
    tabOptions,
    selectedProductId,
    totalPages,
    totalProducts,
  };
});
