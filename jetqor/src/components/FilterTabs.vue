<script setup lang="ts">
interface TabOption {
  label: string | number;
  value: string | number;
}

interface Props {
  options: TabOption[];
  disabled?: boolean;
}

defineProps<Props>();
const activeTab = defineModel();
</script>

<template>
  <div
    class="w-fit flex select-none gap-2 border-1 border-grayscale-100 rounded-3 bg-white p-1 text-3.5"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <button
      v-for="option in options"
      :key="option.value"
      class="rounded-2 px-6 py-3 text-base transition-all duration-200"
      :class="[
        activeTab === option.value
          ? 'bg-grayscale-100 text-black font-600 shadow-sm'
          : 'bg-transparent text-grey hover:text-grey',
      ]"
      :disabled="disabled"
      @click="!disabled && (activeTab = option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
