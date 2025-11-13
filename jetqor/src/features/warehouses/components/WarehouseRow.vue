<script lang="ts" setup>
import type { Cell } from "../types";
import WarehouseCellPanel from "./WarehouseCellPanel.vue";
import WarehouseCellProduct from "./WarehouseCellProduct.vue";

defineProps<{
  row: {
    id: number;
    cells: Cell[];
  };
}>();
const selectedCellId = ref<number | null>(null);
</script>

<template>
  <div class="flex flex-col gap6 border border-grayscale-200 rounded-4 bg-white p6">
    <div class="flex items-center gap-3">
      <div class="text-3.5 fw-600">
        Ряд {{ row.id }}
      </div>
      <div class="flex items-center gap-1 rounded-1 bg-grayscale-100 p2 text-3.5">
        <div class="i-jq-shopping-cart-filled text-4 text-black" />
        <div class="text-black">
          ?
        </div>
      </div>

      <div class="flex items-center gap-1 rounded-1 bg-grayscale-100 p2 text-3.5">
        Кол-во ячеек: {{ row.cells.length }}
      </div>
    </div>

    <div class="h-1px bg-grayscale-100" />

    <WarehouseCellPanel v-for="cell in row.cells" :key="cell.id">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="text-4.5 text-#1E1E1E fw-600">
            Ячейка {{ cell.id }}
          </div>
          <div v-if="cell.article" class="flex items-center justify-center rounded-1 bg-white p2">
            {{ cell.article }}
          </div>
          <div v-if="false" class="rounded-1 bg-white p2">
            ?
          </div>
        </div>
      </template>

      <template #default>
        <template v-if="cell.entites?.length">
          <WarehouseCellProduct v-for="entite in cell.entites" :key="entite.id" :entite="entite" />
        </template>
        <template v-else>
          <div class="flex flex-1 flex-col items-center justify-between gap-4">
            <div class="size-17 rounded-full bg-white p4">
              <div class="i-jq-paper-fail size-full text-main" />
            </div>

            <div class="text-3.5 text-black fw-600">
              Ячейка пуста
            </div>
          </div>
        </template>
      </template>
    </WarehouseCellPanel>
  </div>
</template>

<style>

</style>
