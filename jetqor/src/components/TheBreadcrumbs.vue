<script setup lang="ts">
import type { BreadcrumbItem } from "~/types";

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<template>
  <nav aria-label="Breadcrumb" class="mb-4">
    <ol class="flex items-center gap-2">
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="text-gray-600 transition-colors hover:text-main"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="text-second">{{ item.label }}</span>

        <span v-if="index < items.length - 1" class="mx-2 text-gray-400">/</span>
      </li>
    </ol>
  </nav>
</template>
