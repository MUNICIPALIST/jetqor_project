<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

const props = defineProps<{
  title: string;
  value: string;
}>();

const { copy } = useClipboard();
function handleCopy() {
  copy(props.value);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    handleCopy();
  }
}
</script>

<template>
  <div class="w-full flex items-center justify-between rounded-3 bg-grayscale-100 p3 text-4.5 fw-500">
    <div>
      {{ title }}
    </div>
    <div class="flex items-center gap-3">
      <div>
        {{ value }}
      </div>
      <div class="tabbable size-6 flex cursor-pointer items-center justify-center active:scale-90" tabindex="0" @click="handleCopy" @keydown="handleKeydown">
        <div class="i-jq-vector text-4.5 text-grey" />
      </div>
    </div>
  </div>
</template>

<style>

</style>
