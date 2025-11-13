import type { Product, ProductsResponse } from "../types";
import { defineQuery, useQuery } from "@pinia/colada";
import api from "~/plugins/api";
import { useSearchProductStore } from "../store/search";

interface GetProductsParams {
  page?: number;
  size?: number;
  search?: string;
}

async function getProducts(params: GetProductsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page)
    searchParams.append("page", params.page.toString());
  if (params.size)
    searchParams.append("size", params.size.toString());
  if (params.search)
    searchParams.append("searchQuery", params.search);

  return await api<ProductsResponse>(`/product/my?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}

export const useProductsQuery = defineQuery(() => {
  const searchStore = useSearchProductStore();

  const query = useQuery({
    key: () => ["products", searchStore.page, searchStore.size, searchStore.searchQuery],
    query: () => getProducts({ page: searchStore.page, size: searchStore.size, search: searchStore.searchQuery }),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: data => data,
  });

  return {
    ...query,
  };
});

export async function getProduct(id: number | string | null) {
  if (!id)
    return null;
  return await api<Product>(`/product/id/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}

export const useProductQuery = defineQuery(() => {
  const route = useRoute();
  const selectedId = ref(route.params?.productId ? Number.parseInt(route.params.productId) : null);
  watch(() => route.params.productId, (newVal) => {
    if (!newVal)
      return;
    selectedId.value = Number.parseInt(newVal);
    console.log("Selected product ID changed:", selectedId.value);
  });

  const enabled = computed(() => !!selectedId.value);

  const query = useQuery({
    key: () => ["product", selectedId.value],
    query: () => {
      if (!selectedId.value)
        return Promise.resolve(null);
      return getProduct(selectedId.value);
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled,
  });

  return {
    ...query,
  };
});
