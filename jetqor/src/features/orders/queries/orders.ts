import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { OrdersResponse, OrderStatus } from "../types";
import { defineQuery, useQuery } from "@pinia/colada";
import { computed } from "vue";

import { useRoute } from "vue-router";
import { orderService } from "../services/orderService";
import { useSearchOrderStore } from "../store/search";

type OrderRouteParams = RouteLocationNormalizedLoaded & {
  params: {
    id: string;
  };
};

interface GetOrdersParams {
  page?: number;
  size?: number;
  status?: OrderStatus | "all";
  expressFilter?: "all" | "express" | "regular";
}

async function getOrders(params: GetOrdersParams = {}): Promise<OrdersResponse> {
  try {
    return await orderService.getMyOrders(params);
  }
  catch (error) {
    console.error("Failed to fetch orders:", error);
    return {
      orders: [],
      pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export const useOrdersQuery = defineQuery(() => {
  const searchStore = useSearchOrderStore();

  const query = useQuery({
    key: () => ["orders", searchStore.page, searchStore.size, searchStore.status, searchStore.expressFilter],
    query: () => getOrders({
      page: searchStore.page,
      size: searchStore.size,
      status: searchStore.status,
      expressFilter: searchStore.expressFilter,
    }),
    staleTime: 30 * 1000,
    placeholderData: data => data,
  });

  return {
    ...query,
  };
});

export const useOrderQuery = defineQuery(() => {
  const route = useRoute() as OrderRouteParams;
  const orderId = ref(Number.parseInt(route.params.id as string) || 0);
  watch(() => route.params.id, (newId) => {
    orderId.value = Number.parseInt(newId);
  });

  const enabled = computed(() => orderId.value !== null);

  const query = useQuery({
    key: () => ["order", String(orderId.value || "")],
    query: async () => {
      if (!orderId.value)
        return Promise.resolve(null);

      try {
        // Делаем отдельный запрос для конкретного заказа
        return await orderService.getOrderById(orderId.value);
      }
      catch (error) {
        console.error("Failed to fetch order by id:", error);
        return null;
      }
    },
    staleTime: 30 * 1000,
    enabled,
  });

  return {
    ...query,
  };
});
