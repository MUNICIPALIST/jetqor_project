<script setup lang="ts">
import type { WarehouseCell, WarehouseRow } from "../../types";
import BaseButton from "@/components/ui/BaseButton/index.vue";

const props = defineProps<{
  rows: WarehouseRow[];
}>();

const emit = defineEmits<{
  (e: "select-cell", row: WarehouseRow, cell: WarehouseCell): void;
}>();

function handleSelectCell(row: WarehouseRow, cell: WarehouseCell) {
  emit("select-cell", row, cell);
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="row in rows"
      :key="row.id"
      class="border border-grayscale-200 rounded-2xl bg-white p-6"
    >
      <!-- Row Header -->
      <div class="flex items-center justify-between border-b border-grayscale-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="text-lg font-semibold">
            {{ row.label }}
          </div>
          <div class="rounded bg-grayscale-100 px-2 py-1.5 text-sm font-medium">
            Кол-во ячеек: {{ row.cells }}
          </div>
        </div>
      </div>

      <!-- Cells -->
      <div class="pt-4 space-y-4">
        <div
          v-for="cell in row.items"
          :key="cell.id"
          class="rounded-2xl bg-grayscale-100 p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-lg font-semibold">
                {{ cell.name }}
              </div>
              <div class="rounded bg-white px-2 py-1.5 text-xs font-medium">
                {{ cell.code }}
              </div>
            </div>

            <BaseButton variant="primary" @click="handleSelectCell(row, cell)">
              Добавить товар
            </BaseButton>
          </div>

          <!-- Cell Content - Display distributed products -->
          <div class="rounded-lg bg-grayscale-100">
            <slot name="cell-content" :cell="cell" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
