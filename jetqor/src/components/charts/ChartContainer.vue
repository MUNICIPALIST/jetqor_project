<script setup lang="ts">
import type { TabOption } from "~/types";

const props = defineProps<{
  title: string;
  subtitle?: string;
  tabs?: TabOption[];
}>();

const emit = defineEmits<{
  (e: "update:period", value: string): void;
}>();

const activeTab = ref(props.tabs?.[0]?.value || "");
</script>

<template>
  <section class="mb-6 rounded-xl bg-white p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="mb-1 heading-4 text-second">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-gray-500">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="tabs" class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="rounded px-3 py-1.5 transition-colors"
          :class="[
            activeTab === tab.value
              ? 'bg-main/10 text-main'
              : 'hover:bg-gray-50',
          ]"
          @click="() => {
            activeTab = tab.value
            emit('update:period', tab.value)
          }"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <slot />
  </section>
</template>
