<script lang="ts" setup>
import type { Warehouse } from "../types";
// import { Motion } from "@vueuse/motion"; // Временно отключено
import { useEditWarehouseModal } from "../composables/useEditWarehouseModal";
import { useWarehousesStore } from "../store/warehouses";

const warehousesStore = useWarehousesStore();
const { openModal } = useEditWarehouseModal();

function onEditClick(e: Event, warehouse: Warehouse) {
  e.stopPropagation();
  warehousesStore.currentWarehouseId = warehouse.id;
  openModal();
}
</script>

<template>
  <div class="w-1/4 flex flex-col gap-6 rounded-3 bg-white p4">
    <div class="w-full flex items-center justify-between rounded-2 bg-grayscale-100 p3">
      <div class="align-middle text-3.5 fw-600">
        Алматы
      </div>
      <div class="size-4 flex items-center justify-center">
        <div class="i-jq-chevron-right text-3 text-gray" />
      </div>
    </div>

    <template v-if="!warehousesStore.isLoadingWarehouses && warehousesStore.warehouses?.length">
      <div class="flex flex-1 flex-col gap-4">
        <Motion
          v-for="warehouse, index in warehousesStore.warehouses"
          :key="warehouse.id"
          as="button"
          class="flex items-center justify-between gap-4 rounded-3 px4 py3 active:scale-95"
          :class="{
            'bg-main text-white fw-700 text-4': warehouse.id === warehousesStore.currentWarehouseId,
            'bg-transparent hover:bg-main/10 text-gray text-4 fw-500': warehouse.id !== warehousesStore.currentWarehouseId,
          }"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: index * 0.05, type: 'spring', stiffness: 150, damping: 30 }"
          @click="warehousesStore.currentWarehouseId = warehouse.id"
        >
          <span>{{ warehouse.name }}</span>
          <button
            class="i-jq-edit-filled size-5"
            :class="{
              'text-white': warehouse.id === warehousesStore.currentWarehouseId,
              'text-main': warehouse.id !== warehousesStore.currentWarehouseId,
            }"
            @click="onEditClick($event, warehouse)"
          />
        </Motion>
      </div>
    </template>
  </div>
</template>
