<script lang="ts" setup>
import type { KaspiOrderStatus, OrderStatus } from "@/features/orders/types/index";
import { KASPI_ORDER_STATUSES } from "@/features/orders/types/index";

interface Props {
  status?: KaspiOrderStatus | OrderStatus;
  type?: "kaspi" | "order";
}

const props = withDefaults(defineProps<Props>(), {
  status: "ACCEPTED_BY_MERCHANT",
  type: "kaspi",
});

const ORDER_STATUS_COLORS = {
  packaging: "bg-other-orange",
  assembly: "bg-other-yellow",
  packed: "bg-other-blue",
  completed: "bg-other-green",
  cancelled: "bg-other-red",
  return_request: "bg-other-brown",
  return: "bg-other-gray",
};

const STATUS_TO_COLOR = {
  [KASPI_ORDER_STATUSES.APPROVED_BY_BANK]: "bg-other-yellow",
  [KASPI_ORDER_STATUSES.ACCEPTED_BY_MERCHANT]: "bg-other-orange",
  [KASPI_ORDER_STATUSES.COMPLETED]: "bg-other-green",
  [KASPI_ORDER_STATUSES.CANCELLED]: "bg-other-red",
  [KASPI_ORDER_STATUSES.CANCELLING]: "bg-other-red",
  [KASPI_ORDER_STATUSES.KASPI_DELIVERY_RETURN_REQUESTED]: "bg-other-brown",
  [KASPI_ORDER_STATUSES.RETURNED]: "bg-other-gray",
};

const statusClasses = computed(() => {
  if (props.type === "order") {
    return ORDER_STATUS_COLORS[props.status as OrderStatus] || "bg-other-gray";
  }
  return STATUS_TO_COLOR[props.status as KaspiOrderStatus] || "bg-other-gray";
});

const statusLabel = computed(() => {
  if (props.type === "order") {
    const orderStatusLabels = {
      packaging: "Упаковка",
      assembly: "На сборке",
      packed: "Готов к отправке",
      completed: "Завершен",
      cancelled: "Отменен",
      return_request: "Запрошен возврат",
      return: "Возврат",
    };
    return orderStatusLabels[props.status as OrderStatus] || props.status;
  }
  return KASPI_ORDER_STATUSES[props.status as KaspiOrderStatus] || props.status;
});
</script>

<template>
  <div class="mr-2 h-full flex items-center rounded px-2 py-1 align-middle text-black" :class="statusClasses">
    {{ statusLabel }}
  </div>
</template>
