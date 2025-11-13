<script setup lang="ts">
import type { CellLocation, InvoiceProductDetails } from "../../types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { useProductDistributionStore } from "../../store/productDistribution";
import SelectProductModalContent from "./SelectProductModalContent.vue";

const props = defineProps<{
  showModal: boolean;
  cellLocation: CellLocation | null;
  products: InvoiceProductDetails[];
}>();

const emit = defineEmits<{
  (e: "update:showModal", value: boolean): void;
  (e: "close"): void;
  (e: "save", quantities: Record<number, number> | undefined): void;
}>();

const modalContentRef = ref<InstanceType<typeof SelectProductModalContent> | null>(null);
const productDistributionStore = useProductDistributionStore();

// Save products to the distribution store
function handleSave() {
  if (!modalContentRef.value?.quantities || !props.cellLocation)
    return;

  // Add products to store
  productDistributionStore.addDistributedProducts(
    props.cellLocation.id,
    props.cellLocation.code,
    props.cellLocation.name,
    modalContentRef.value.quantities,
  );

  emit("save", modalContentRef.value.quantities);
}
</script>

<template>
  <VueFinalModal
    :model-value="showModal"
    class="flex items-center justify-center"
    content-class="relative rounded-2xl bg-white p-6 w-[700px]"
    overlay-class="bg-black/40"
    @update:model-value="$emit('update:showModal', $event)"
  >
    <div v-if="cellLocation" class="flex items-center gap-6">
      <button
        class="size-11 flex items-center justify-center rounded-full bg-grayscale-100 p-2.5 transition-all active:scale-90 hover:scale-105"
        @click="$emit('close')"
      >
        <div class="i-jq-chevron-left h-4 w-4 text-black" />
      </button>
      <h2 class="text-lg font-semibold">
        Выберите товары
      </h2>
    </div>

    <div v-if="cellLocation" class="mt-4 text-sm text-grey font-medium">
      Выберите товары, который вы хотите прикрепить:
    </div>

    <!-- Location Info -->
    <div v-if="cellLocation" class="mt-4 flex items-center gap-2">
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cellLocation.warehouse }}
      </div>
      <span class="i-jq-chevron-right h-4 w-4 text-grey" />
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cellLocation.shelf }}
      </div>
      <span class="i-jq-chevron-right h-4 w-4 text-grey" />
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cellLocation.row }}
      </div>
      <span class="i-jq-chevron-right h-4 w-4 text-grey" />
      <div class="rounded bg-grayscale-100 px-3 py-3 text-sm font-medium">
        {{ cellLocation.name }}
      </div>
    </div>

    <SelectProductModalContent
      v-if="cellLocation"
      ref="modalContentRef"
      :products="products"
      @close="$emit('close')"
      @save="$emit('save', modalContentRef?.quantities)"
    />

    <div v-if="cellLocation" class="mt-4 flex justify-center">
      <BaseButton
        variant="primary"
        class="w-full"
        :disabled="!modalContentRef?.quantities"
        @click="handleSave"
      >
        Прикрепить
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
