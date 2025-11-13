<script setup lang="ts">
import type { TabOption } from "~/types";
import { ref } from "vue";

const emit = defineEmits<{
  (e: "update:period", value: string): void;
}>();

const tabs = ref<TabOption[]>([
  { label: "За весь период", value: "all" },
  { label: "По годам", value: "yearly" },
  { label: "По месяцам", value: "monthly" },
  { label: "По неделям", value: "weekly" },
]);

const activeTab = ref("all");

function handleTabChange(value: string) {
  activeTab.value = value;
  emit("update:period", value);
}
</script>

<template>
  <header class="mb-8 flex items-center justify-between">
    <h1 class="heading-2 text-second">
      Главная
    </h1>

    <div class="flex gap-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="rounded-lg px-4 py-2 transition-colors"
        :class="[
          activeTab === tab.value
            ? 'bg-main text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50',
        ]"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </header>
</template>
