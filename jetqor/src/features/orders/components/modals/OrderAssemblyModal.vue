<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { useOrderQuery } from "../../queries/orders";
import { orderService } from "../../services/orderService";
import { useOrderProductDistributionStore } from "../../store/orderProductDistribution";

const props = defineProps<{
  title?: string;
  id: string; // Make id required and expect it as string
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const orderQuery = useOrderQuery();
const isLoading = ref(false);
const showSuccessMessage = ref(false);
const productDistributionStore = useOrderProductDistributionStore();
const errorMessage = ref<string | null>(null);

onMounted(() => {
  console.log("OrderAssemblyModal mounted with id:", props.id);
});

onUnmounted(() => {
  console.log("OrderAssemblyModal unmounted");
});

async function handleConfirm() {
  if (isLoading.value)
    return;

  // Проверяем, распределены ли все товары
  if (!productDistributionStore.isAllProductsDistributed) {
    errorMessage.value = "Не все товары распределены по ячейкам склада";
    setTimeout(() => {
      errorMessage.value = null;
    }, 5000);
    return;
  }

  try {
    isLoading.value = true;

    // Отправляем информацию о распределении товаров на сервер
    await orderService.approveOrderAssembly(props.id, productDistributionStore.distributedProducts);

    // Ожидаем обновления статуса в Kaspi
    console.warn("Ожидаем 5 секунд для обновления статуса заказа в Kaspi...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // После успешного сохранения обновляем статус заказа на "ready_for_delivery"
    // await orderService.updateOrderStatus(props.id, "ready_for_delivery");

    // Обновляем данные заказа
    await orderQuery.refetch();

    // Показываем сообщение об успехе
    showSuccessMessage.value = true;

    // Через 3 секунды скрываем сообщение и закрываем модальное окно
    setTimeout(() => {
      showSuccessMessage.value = false;
      // Очищаем состояние распределения товаров
      productDistributionStore.clearDistribution();
      // Отправляем событие сохранения
      emit("save");
    }, 300);
  }
  catch (error) {
    console.error("Error updating order assembly:", error);
    errorMessage.value = "Произошла ошибка при сохранении распределения товаров";
    setTimeout(() => {
      errorMessage.value = null;
    }, 5000);
  }
  finally {
    isLoading.value = false;
  }
}

function handleClose() {
  console.log("handleClose called");
  emit("close");
}

function handleSave() {
  console.log("handleSave called");
  emit("save");
}
</script>

<template>
  <VueFinalModal
    class="fixed inset-0"
    content-class="w-[1100px] absolute right-0 top-0 h-full flex flex-col bg-grayscale-100 rounded-l-8 p-8"
    overlay-class="bg-black/40"
    content-transition="vfm-slide-right"
    overlay-transition="vfm-fade"
    :hide-overlay="false"
  >
    <!-- Header with title and close button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <button
          class="size-11 flex items-center justify-center rounded-full bg-white p-2.5 transition-all active:scale-90 hover:scale-105"
          @click="handleClose"
        >
          <div class="i-jq-close h-4 w-4 text-black" />
        </button>
        <div class="text-2xl font-bold">
          {{ title }}
        </div>
      </div>

      <!-- Confirm button -->
      <BaseButton
        variant="primary"
        class="px-6 py-3 text-base font-medium"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleConfirm"
      >
        <template v-if="isLoading">
          Обработка...
        </template>
        <template v-else-if="showSuccessMessage">
          Готово
        </template>
        <template v-else>
          Завершить сборку
        </template>
      </BaseButton>
    </div>

    <div class="my-6 h-px w-full bg-grayscale-200" />

    <!-- Main content -->
    <div class="flex-1 overflow-y-auto">
      <slot />

      <!-- Success message -->
      <div v-if="showSuccessMessage" class="fixed inset-x-0 top-4 flex justify-center">
        <div class="bg-green-100 text-green-700 rounded-lg px-6 py-3">
          Заказ успешно собран!
        </div>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="fixed inset-x-0 top-4 flex justify-center">
        <div class="bg-red-100 text-red-700 rounded-lg px-6 py-3">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
