<script lang="ts" setup>
import BaseButton from "@/components/ui/BaseButton/index.vue";
import EmptyState from "~/features/warehouses/components/EmptyState.vue";
import WarehouseRow from "~/features/warehouses/components/WarehouseRow.vue";
import WarehouseSelect from "~/features/warehouses/components/WarehouseSelect.vue";
import { useAddWarehouseModal } from "~/features/warehouses/composables/useAddWarehouseModal";
import { useEditWarehouseModal } from "~/features/warehouses/composables/useEditWarehouseModal";
import { useWarehousesStore } from "~/features/warehouses/store/warehouses";

const warehousesStore = useWarehousesStore();
const { openModal: openAddWarehouseModal } = useAddWarehouseModal();
const { openModal: openEditWarehouseModal } = useEditWarehouseModal();

onMounted(() => {
  console.warn("Warehouse page mounted, initializing warehouses");
  warehousesStore.initWarehouses();
});
</script>

<template>
  <div class="size-full flex gap-6">
    <WarehouseSelect />

    <div class="flex flex-1 flex-col gap-3">
      <!-- Кнопка "Добавить склад" всегда видима сверху, независимо от наличия складов -->
      <div class="mb-4 flex justify-end">
        <BaseButton variant="primary" @click="openAddWarehouseModal">
          <span class="i-jq-plus-filled mr-2 h-4 w-4" />
          Добавить склад
        </BaseButton>
      </div>

      <!-- Если нет складов -->
      <EmptyState
        v-if="!warehousesStore.warehouses?.length"
        icon="card-box"
        title="Нет доступных складов"
        description="Сначала необходимо добавить склад в систему"
      >
        <BaseButton variant="primary" @click="openAddWarehouseModal">
          Добавить склад
        </BaseButton>
      </EmptyState>

      <!-- Если есть склады, но нет стеллажей -->
      <EmptyState
        v-else-if="warehousesStore.racks.length === 0"
        icon="card-box"
        title="Нет стеллажей на складе"
        description="Добавьте стеллажи для этого склада"
      >
        <BaseButton variant="primary" @click="openEditWarehouseModal">
          Добавить стеллаж
        </BaseButton>
      </EmptyState>

      <!-- Если есть стеллажи -->
      <template v-else>
        <div class="flex shrink-0 items-center justify-between">
          <div class="min-w-500px overflow-x-auto">
            <FilterTabs v-model="warehousesStore.currentRackId" :options="warehousesStore.racksOptions" />
          </div>
          <!-- Кнопка "Добавить стеллаж" -->
          <div class="mb-4 flex justify-end">
            <BaseButton variant="secondary" @click="openEditWarehouseModal">
              <span class="i-jq-plus-filled mr-2 h-4 w-4 shrink-0" />
              Добавить стеллаж
            </BaseButton>
          </div>
        </div>

        <!-- Если нет рядов на выбранном стеллаже -->
        <EmptyState
          v-if="warehousesStore.warehouseRowsOnSelectedRack.length === 0"
          icon="category"
          title="Нет рядов на стеллаже"
          description="Добавьте ряды для выбранного стеллажа"
        >
          <BaseButton variant="primary" @click="openEditWarehouseModal">
            Добавить ряд
          </BaseButton>
        </EmptyState>

        <!-- Отображение рядов -->
        <template v-else>
          <WarehouseRow
            v-for="row in warehousesStore.warehouseRowsOnSelectedRack"
            :key="row.id"
            :row="row"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<style>

</style>

<route lang="yaml">
    meta:
      layout: default
</route>
