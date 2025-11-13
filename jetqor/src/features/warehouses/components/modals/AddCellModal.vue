<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { cellService } from "../../services/cellService";
import { useWarehousesStore } from "../../store/warehouses";

interface Props {
  rackId: number;
  rowId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const warehousesStore = useWarehousesStore();
const isLoading = ref(false);

async function handleCreate() {
  try {
    isLoading.value = true;
    await cellService.create({
      name: props.rowId.toString(),
      article: `R${props.rackId}C${props.rowId}`,
      storageId: warehousesStore.currentWarehouse!.id,
      rack: props.rackId,
      row: props.rowId,
    });
    emit("success");
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative flex flex-col max-w-xl w-full mx-4 p-6 bg-white rounded-lg"
    overlay-class="bg-black/40"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
    :click-to-close="false"
  >
    <header class="flex items-center justify-between">
      <div class="text-xl font-bold">
        Создание ячейки
      </div>
      <button class="p-1" @click="emit('close')">
        <Icon name="close" class="h-4 w-4" />
      </button>
    </header>

    <div class="mt-6 flex flex-col gap-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <div class="mb-2 text-sm font-medium">
            Номер стеллажа
          </div>
          <div class="h-11 flex items-center border border-gray-200 rounded-lg px-3">
            {{ props.rackId }}
          </div>
        </div>
        <div class="flex-1">
          <div class="mb-2 text-sm font-medium">
            Номер ряда
          </div>
          <div class="h-11 flex items-center border border-gray-200 rounded-lg px-3">
            {{ props.rowId }}
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <div class="mt-0.5 size-5 flex flex-shrink-0 items-center justify-center rounded-full bg-main">
          <Icon name="info" class="h-3 w-3 text-white" />
        </div>
        <div class="text-sm">
          После нажатия "Создать" будет создана ячейка с номером <span class="font-medium">R{{ props.rackId }}C{{ props.rowId }}</span>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-4">
      <BaseButton variant="secondary" @click="emit('close')">
        Отмена
      </BaseButton>
      <BaseButton
        variant="primary"
        :loading="isLoading"
        @click="handleCreate"
      >
        Создать
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
