<script lang="ts" setup>
import type { OrderStatus } from "../types";
import { useRoute } from "vue-router";
import useToasters from "~/composables/useToasters";
import { warehouseService } from "../../warehouses/services/warehouseService";
import { statusSteps } from "../data";
import { orderService } from "../services/orderService";
import OrderStatusItem from "./OrderStatusItem.vue";

interface Props {
  status?: OrderStatus;
  orderData?: any; // Optional order data to avoid API calls
}

const props = withDefaults(defineProps<Props>(), {
  status: "packaging" as OrderStatus,
  orderData: null,
});

// Get route to access order ID
const route = useRoute();

// State for loading actions
const isDownloading = ref(false);
const isUpdatingStatus = ref(false);
const { error: toastError } = useToasters();

// Map status values to step indexes for progression
const statusMap = {
  packaging: 0,
  assembly: 1,
  packed: 2,
  completed: 3,
  cancelled: -1, // Special case for cancelled orders
  return_request: -1, // Special case for return requests
  return: -1, // Special case for returns
};

// Determine current step index based on order status
const currentStepIndex = computed(() => {
  return statusMap[props.status] ?? -1;
});

// Check if order is cancelled or has special status for special handling
const isOrderCancelled = computed(() => {
  return props.status === "cancelled" || props.status === "return_request" || props.status === "return";
});

// Filter steps to show only active workflow statuses (not final statuses like cancelled, return, etc.)
const activeStatusSteps = computed(() => {
  return statusSteps.filter(step =>
    ["packaging", "assembly", "packed", "completed"].includes(step.key),
  );
});

// Get button text for each step based on current status
function getButtonText(step: any, index: number) {
  if (index < currentStepIndex.value) {
    return "Завершено";
  }

  if (index === currentStepIndex.value) {
    // Current active step - show action button
    switch (step.key) {
      case "packaging":
        return isDownloading.value ? "Скачивание..." : "Скачать накладную";
      case "assembly":
        return isUpdatingStatus.value ? "Обновление..." : "Собран";
      case "packed":
        return ""; // Пустая строка для скрытия кнопки
      case "completed":
        return ""; // Пустая строка для скрытия кнопки
      default:
        return step.completedLabel;
    }
  }

  return step.completedLabel;
}

// Check if button should be shown for the step
function shouldShowButton(step: any, index: number) {
  if (index === currentStepIndex.value) {
    return !["packed", "completed"].includes(step.key);
  }
  return index < currentStepIndex.value;
}// Get button props for each step
function getButtonProps(step: any, index: number) {
  const baseProps = {
    disabled: index !== currentStepIndex.value,
  };

  if (index === currentStepIndex.value) {
    switch (step.key) {
      case "packaging":
        return { ...baseProps, disabled: isDownloading.value };
      case "assembly":
        return { ...baseProps, disabled: isUpdatingStatus.value };
      case "packed":
        return { ...baseProps, disabled: true }; // Отключаем кнопку для "Готов к отправке"
      case "completed":
        return { ...baseProps, disabled: true }; // Отключаем кнопку для "Завершен"
      default:
        return baseProps;
    }
  }

  return baseProps;
}

// Handle step click with specific actions
function handleStepClick(step: any, index: number) {
  if (index !== currentStepIndex.value)
    return;

  switch (step.key) {
    case "packaging":
      downloadInvoiceForPackaging();
      break;
    case "assembly":
      markAsPacked();
      break;
    case "packed":
      // For packed status, no action needed
      break;
    case "completed":
      // For completed status, no action needed
      break;
  }
}

async function forceDownload(url: string, filename?: string) {
  const res = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename || "invoice.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

// Function to download invoice for packaging status
async function downloadInvoiceForPackaging() {
  const orderIdParam = "id" in route.params ? route.params.id : null;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  if (!orderId || isDownloading.value)
    return;

  try {
    isDownloading.value = true;

    // Debug: log order data structure
    console.error("Order data:", props.orderData);

    let approvalProducts = [];

    if (props.orderData && props.orderData.products && props.orderData.storage_id) {
      try {
        // Get all warehouses and find the one with matching storage_id
        console.error("Fetching all warehouses to find storage_id:", props.orderData.storage_id);
        const warehouses = await warehouseService.getWarehouses();

        const targetWarehouse = warehouses.find(warehouse => warehouse.id === props.orderData.storage_id);

        if (targetWarehouse && targetWarehouse.cells && targetWarehouse.cells.length > 0) {
          const firstCell = targetWarehouse.cells[0];
          console.error("Using first cell:", firstCell);

          approvalProducts = props.orderData.products.map((orderProduct: any) => ({
            product_id: orderProduct.productId,
            cell_id: firstCell.id,
            count: orderProduct.count,
            cell_code: firstCell.article || `Cell-${firstCell.id}`,
            cell_name: firstCell.name || `Ячейка ${firstCell.id}`,
          }));
        }
        else {
          console.error("No warehouse found with storage_id:", props.orderData.storage_id, "or no cells in warehouse");
          console.error("Available warehouses:", warehouses.map(w => ({ id: w.id, name: w.name, cellsCount: w.cells?.length || 0 })));
          return;
        }
      }
      catch (storageError) {
        console.error("Error fetching warehouses data:", storageError);
        return;
      }
    }
    else {
      console.error("Order data, products, or storage_id not available");
      console.error("Order structure:", {
        hasOrderData: !!props.orderData,
        hasProducts: !!(props.orderData?.products),
        hasStorageId: !!(props.orderData?.storage_id),
        storageId: props.orderData?.storage_id,
      });
      return;
    }

    console.error("Approval products:", approvalProducts);

    // Quick approve and download
    // const _blob = await orderService.quickApproveAndDownload(orderId, approvalProducts);
    await orderService.approveOrderAssembly(orderId, approvalProducts);

    // Ожидаем обновления статуса в Kaspi перед скачиванием
    console.warn("Ожидаем 5 секунд для обновления статуса заказа в Kaspi...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // NEW: get link by Kaspi code and download
    const kaspiCode = props.orderData?.kaspi_code ?? orderId;
    const url = await orderService.getConsignmentLink(kaspiCode);
    await forceDownload(url as string, `invoice-${kaspiCode}.pdf`);

    // Refresh page to update order status
    window.location.reload();
  }
  catch (error) {
    console.error("Ошибка при скачивании накладной:", error);
    const msg = error instanceof Error ? error.message : "Попробуйте позже";
    toastError(`Не удалось скачать накладную: ${msg}`);
  }
  finally {
    isDownloading.value = false;
  }
}

// Function to mark order as packed
async function markAsPacked() {
  const orderIdParam = "id" in route.params ? route.params.id : null;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  if (!orderId || isUpdatingStatus.value)
    return;

  try {
    isUpdatingStatus.value = true;

    // Убираем обновление статуса, только отправляем уведомление о упаковке
    // await orderService.updateOrderStatus(orderId, "packed");

    // Отправляем уведомление о упаковке
    await orderService.notifyInvoicePacked(orderId);

    // Refresh page to update order status
    window.location.reload();
  }
  catch (error) {
    console.error("Ошибка при обновлении статуса заказа:", error);
    const msg = error instanceof Error ? error.message : "Попробуйте позже";
    toastError(`Не удалось обновить статус: ${msg}`);
  }
  finally {
    isUpdatingStatus.value = false;
  }
}
</script>

<template>
  <!-- Special display for cancelled orders -->
  <div v-if="isOrderCancelled" class="w-full flex items-center justify-center p-4">
    <div
      class="w-full rounded-lg p-4 text-center"
      :class="{
        'bg-red-50': props.status === 'cancelled',
        'bg-orange-50': props.status === 'return_request',
        'bg-gray-50': props.status === 'return',
      }"
    >
      <div class="mb-2 flex justify-center">
        <span
          class="h-8 w-8"
          :class="{
            'text-red-500 i-jq-close': props.status === 'cancelled',
            'text-orange-500 i-jq-paper-fail': props.status === 'return_request',
            'text-gray-500 i-jq-paper-fail': props.status === 'return',
          }"
        />
      </div>
      <h3
        class="font-medium"
        :class="{
          'text-red-700': props.status === 'cancelled',
          'text-orange-700': props.status === 'return_request',
          'text-gray-700': props.status === 'return',
        }"
      >
        {{
          props.status === 'cancelled'
            ? 'Заказ отменен'
            : props.status === 'return_request'
              ? 'Запрос на возврат'
              : 'Заказ возвращен'
        }}
      </h3>
      <p
        class="mt-1 text-sm"
        :class="{
          'text-red-600': props.status === 'cancelled',
          'text-orange-600': props.status === 'return_request',
          'text-gray-600': props.status === 'return',
        }"
      >
        {{
          props.status === 'cancelled'
            ? 'Этот заказ был отменен и не будет обработан.'
            : props.status === 'return_request'
              ? 'По этому заказу был подан запрос на возврат.'
              : 'Этот заказ был возвращен.'
        }}
      </p>
    </div>
  </div>

  <!-- Normal status progress for active orders -->
  <div v-else class="w-full flex items-center justify-between">
    <div v-for="(step, index) in activeStatusSteps" :key="index" class="flex justify-between">
      <OrderStatusItem
        :step="step"
        :icon-color="index <= currentStepIndex ? step.iconColor : 'text-gray-400'"
        :button-props="getButtonProps(step, index)"
        :button-text="getButtonText(step, index)"
        :show-button="shouldShowButton(step, index)"
        :last="index === activeStatusSteps.length - 1"
        :is-current="index === currentStepIndex"
        @click="handleStepClick(step, index)"
      />

      <div
        v-if="index < activeStatusSteps.length - 1"
        class="relative top-0 mt-7 h-2px w-full"
        :class="{
          'bg-grayscale-200 text-grayscale-200': index >= currentStepIndex,
          'bg-grayscale-400 text-grayscale-400': index < currentStepIndex,
        }"
      >
        <div class="i-jq-chevron-right absolute right--2 top-1/2 translate-y--1/2" />
      </div>
    </div>
  </div>
</template>
