<script setup lang="ts">
import AppInput from "@/components/ui/AppInput/index.vue";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import useToasters from "@/composables/useToasters";
import { warehouseService } from "../../services/warehouseService";
import { useWarehousesStore } from "../../store/warehouses";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const warehousesStore = useWarehousesStore();
const { success, error } = useToasters();

const warehouseName = ref("");
const warehouseCity = ref("Almaty"); // Default city
const warehouseAddress = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

async function createWarehouse() {
  if (!warehouseName.value || !warehouseCity.value || !warehouseAddress.value) {
    errorMessage.value = "Все поля должны быть заполнены";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Create the warehouse using the service
    const warehouseData = {
      name: warehouseName.value,
      city: warehouseCity.value,
      address: warehouseAddress.value,
    };

    await warehouseService.createWarehouse(warehouseData);
    console.warn("Warehouse created, about to refresh warehouses list");

    // First emit success event
    console.warn("Emitting success event");
    emit("success");

    // Then refresh the warehouses list in the store
    await warehousesStore.refreshWarehouses();

    // Show success toast notification
    success(`Склад "${warehouseName.value}" успешно создан`);

    // Then emit close event after a short delay
    setTimeout(() => {
      console.warn("Emitting close event after timeout");
      emit("close");
    }, 10);
  }
  catch (err) {
    console.error("Error creating warehouse:", err);
    errorMessage.value = "Произошла ошибка при создании склада";
    // Show error toast notification
    error("Ошибка при создании склада");
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="text-xl font-bold">
      Склад
    </div>

    <!-- Form -->
    <div class="flex flex-col gap-4">
      <!-- Warehouse name and city -->
      <div class="flex gap-4">
        <AppInput
          v-model="warehouseName"
          label="Наименование"
          class="flex-1"
          placeholder="Введите название склада"
        />
        <AppInput
          v-model="warehouseCity"
          label="Город"
          class="flex-1"
          placeholder="Введите город"
        />
      </div>

      <!-- Warehouse address -->
      <div>
        <AppInput
          v-model="warehouseAddress"
          label="Адрес"
          class="w-full"
          placeholder="Введите адрес склада"
        />
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="text-red-500 mt-2">
        {{ errorMessage }}
      </div>

      <!-- Save button -->
      <div class="mt-4 flex justify-end">
        <BaseButton
          variant="primary"
          :loading="isLoading"
          @click="createWarehouse"
        >
          Создать
        </BaseButton>
      </div>
    </div>
  </div>
</template>
