<script setup lang="ts">
import type { Cell } from "../../types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { useAddCellsModal } from "../../composables/useAddCellsModal";

interface RackRow {
  id: number;
  cells: Cell[];
}

interface Props {
  rack: {
    id: number;
    rows: RackRow[];
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "delete"): void;
  (e: "addRow"): void;
}>();

const { openModal: openAddCellsModal } = useAddCellsModal();

function handleAddCell(rowId: number) {
  openAddCellsModal(props.rack.id, rowId);
}
</script>

<template>
  <div class="border border-gray-100 rounded-2xl">
    <div class="flex flex-col gap-4 p-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <AppInput
          :model-value="`Стеллаж ${rack.id}`"
          class="flex-1"
          label="Наименование"
          readonly
        />

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 rounded-lg bg-gray-100 px-2 py-2">
            <Icon name="bag" class="h-5 w-5" />
            <span>{{ rack.rows.reduce((acc, row) => acc + row.cells.reduce((cellAcc, cell) => cellAcc + cell.entites.length, 0), 0) }}</span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-gray-100 px-2 py-2">
            <Icon name="category" class="h-5 w-5" />
            <span>{{ rack.rows.reduce((acc, row) => acc + row.cells.length, 0) }}</span>
          </div>
          <BaseButton
            variant="error-outline"
            class="!h-11 !w-11 !p-0"
            @click="emit('delete')"
          >
            <Icon name="delete" class="h-5 w-5" />
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="emit('addRow')"
          >
            Добавить ряд
          </BaseButton>
        </div>
      </div>

      <!-- Rows list -->
      <div class="flex flex-col gap-3">
        <div
          v-for="row in rack.rows"
          :key="row.id"
          class="flex items-center gap-4 rounded-lg bg-gray-50 p-3"
        >
          <AppInput
            :model-value="`Ряд ${row.id}`"
            class="flex-1"
            readonly
          />

          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 rounded-lg bg-gray-100 px-2 py-2">
              <Icon name="bag" class="h-5 w-5" />
              <span>{{ row.cells.reduce((acc, cell) => acc + cell.entites.length, 0) }}</span>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-gray-100 px-2 py-2">
              <Icon name="category" class="h-5 w-5" />
              <span>{{ row.cells.length }}</span>
            </div>
            <BaseButton
              variant="primary"
              @click="handleAddCell(row.id)"
            >
              Добавить ячейку
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
