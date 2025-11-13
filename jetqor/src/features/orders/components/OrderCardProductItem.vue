<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

const props = defineProps<{
  product: any;
}>();

const { copy } = useClipboard();
function handleCopy() {
  copy(props.product);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    handleCopy();
  }
}
</script>

<template>
  <div class="w-full flex items-center justify-between rounded-3 bg-grayscale-100 p3 text-4.5 fw-500">
    <div class="flex flex-col justify-between gap-6 text-4.5 fw-500">
      <div>
        {{ product.name }}
      </div>

      <!-- position of the product -->
      <div class="flex items-center gap-4 text-3.5 text-black fw-500">
        <div>
          Склад А
        </div>

        <div class="h-3.5 flex items-center">
          <div class="i-jq-long-arrow-right h-4 text-grayscale-400" />
        </div>

        <div>
          Стелаж 6
        </div>

        <div class="h-3.5 flex items-center">
          <div class="i-jq-long-arrow-right h-4 text-grayscale-400" />
        </div>

        <div>
          Ячейка 68
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div>
        {{ product.stockA }}
      </div>
      <div class="tabbable size-6 flex cursor-pointer items-center justify-center active:scale-90" tabindex="0" @click="handleCopy" @keydown="handleKeydown">
        <div class="i-jq-vector text-4.5 text-grey" />
      </div>
    </div>
  </div>
</template>

<style>

</style>
