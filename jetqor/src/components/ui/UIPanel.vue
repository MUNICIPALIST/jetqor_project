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
  <div v-auto-animate class="select-none overflow-hidden rounded-3 bg-white p4">
    <div
      class="flex cursor-pointer items-center justify-between p-2" tabindex="0" @click="togglePanel" @keydown="handleKeydown"
    >
      <div class="text-4.5 fw-600">
        <slot name="header" />
      </div>
      <div
        class="aspect-square size-11 flex items-center justify-center border-2 border-#F4F4F4 rounded-full p3 pb-3.5 transition-all" :class="{
          '!pb-2.5': isOpen,
        }"
      >
        <div :class="chevronClass" class="i-jq-chevron-up transition-transform duration-300 ease" />
      </div>
    </div>
    <div v-if="isOpen" class="p-2">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>
