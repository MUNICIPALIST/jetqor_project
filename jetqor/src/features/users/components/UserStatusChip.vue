<script setup lang="ts">
import type { UserRole } from "../types";

const props = defineProps<{
  blocked?: boolean;
  role?: UserRole;
}>();

const roleLabels = {
  administrator: "Администратор",
  manager: "Менеджер",
  client: "Клиент",
} as const;

const roleClasses = {
  administrator: "bg-blue-100 text-blue-600",
  manager: "bg-purple-100 text-purple-600",
  client: "bg-gray-100 text-gray-600",
} as const;
</script>

<template>
  <div v-if="role" class="rounded-full px-3 py-1 text-sm font-medium" :class="roleClasses[role]">
    {{ roleLabels[role] }}
  </div>
  <div v-if="blocked !== undefined" class="rounded-full px-3 py-1 text-sm font-medium" :class="blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
    {{ blocked ? 'Заблокирован' : 'Активен' }}
  </div>
</template>
