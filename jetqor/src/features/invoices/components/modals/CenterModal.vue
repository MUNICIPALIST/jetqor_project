<script setup lang="ts">
import type { Slot } from "vue";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { computed, ref, watch } from "vue";
import { VueFinalModal } from "vue-final-modal";

defineProps<{
  title?: string;
  cell: {
    id: number;
    name: string;
    code: string;
    warehouse: string;
    shelf: string;
    row: string;
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", quantities: Record<string, number>): void;
}>();

const modalContentRef = ref<any>();

const hasErrors = computed(() => {
  return modalContentRef.value?.hasErrors || false;
});

const noProductsSelected = computed(() => {
  if (!modalContentRef.value?.quantities)
    return true;
  return Object.values(modalContentRef.value.quantities).every(v => !v);
});

const canSave = computed(() => {
  return !hasErrors.value && !noProductsSelected.value;
});

function handleSave() {
  if (!canSave.value || !modalContentRef.value?.quantities)
    return;
  emit("save", modalContentRef.value.quantities);
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative rounded-2xl bg-white p-6 w-[700px]"
    overlay-class="bg-black/40"
  >
    <div class="flex items-center gap-6">
      <button
        class="size-11 flex items-center justify-center rounded-full bg-grayscale-100 p-2.5 transition-all active:scale-90 hover:scale-105"
        @click="emit('close')"
      >
        <div class="i-jq-chevron-left h-4 w-4 text-black" />
      </button>
      <h2 class="text-lg font-semibold">
        {{ title }}
      </h2>
    </div>

    <div class="mt-4 text-sm text-grey font-medium">
      Выберите товары, который вы хотите прикрепить:
    </div>

    <!-- Location Info -->
    <div class="mt-4 flex items-center gap-2">
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cell.warehouse }}
      </div>
      <span class="i-jq-chevron-right h-4 w-4 text-grey" />
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cell.shelf }}
      </div>
      <span class="i-jq-chevron-right h-4 w-4 text-grey" />
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cell.row }}
      </div>
      <span class="i-jq-chevron-right h-4 w-4 text-grey" />
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cell.name }}
      </div>
    </div>

    <slot ref="modalContentRef" />

    <div class="mt-4 flex justify-center">
      <BaseButton variant="primary" class="w-full" :disabled="!canSave" @click="handleSave">
        Прикрепить
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
