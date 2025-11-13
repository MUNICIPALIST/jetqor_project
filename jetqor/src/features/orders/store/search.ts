import type { OrderStatus } from "../types";
import { defineStore } from "pinia";

export const useSearchOrderStore = defineStore("searchOrder", () => {
  const page = ref(1);
  const size = ref(10);
  const status = ref<OrderStatus | "all">("all");
  const expressFilter = ref<"all" | "express" | "regular">("all");

  function setPage(newPage: number) {
    page.value = newPage;
  }

  function setSize(newSize: number) {
    size.value = newSize;
  }

  function setStatus(newStatus: OrderStatus | "all") {
    status.value = newStatus;
    // Reset page when status changes
    page.value = 1;
  }

  function setExpressFilter(newExpressFilter: "all" | "express" | "regular") {
    expressFilter.value = newExpressFilter;
    // Reset page when filter changes
    page.value = 1;
  }

  function reset() {
    page.value = 1;
    size.value = 10;
    status.value = "all";
    expressFilter.value = "all";
  }

  function nextPage() {
    page.value += 1;
  }

  return {
    page: readonly(page),
    size: readonly(size),
    status: readonly(status),
    expressFilter: readonly(expressFilter),
    setPage,
    setSize,
    setStatus,
    setExpressFilter,
    reset,
    nextPage,
  };
});
