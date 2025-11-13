<script lang="ts" setup>
const isOpen = defineModel();

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    togglePanel();
  }
}

const chevronClass = computed(() => ({
  "rotate-180": isOpen.value,
}));
</script>

<template>
  <div v-auto-animate class="select-none overflow-hidden rounded-4 bg-grayscale-100 p4">
    <div
      class="flex cursor-pointer items-center justify-between" tabindex="0" @click="togglePanel" @keydown="handleKeydown"
    >
      <slot name="header" />
      <div class="flex items-center gap-5">
        <div>
          <BaseButton variant="secondary" icon="i-jq-download" class="!bg-white">
            Скачать штрихкод
          </BaseButton>
        </div>
        <div
          class="aspect-square size-11 flex items-center justify-center border-2 border-#F4F4F4 rounded-full bg-white p3 pb-3.5 transition-all" :class="{
            '!pb-2.5': isOpen,
          }"
        >
          <div :class="chevronClass" class="i-jq-chevron-up transition-transform duration-300 ease" />
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="p-2">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>
