<script setup lang="ts">
import type { User } from "../types";
import { useRouter } from "vue-router";

const props = defineProps<{
  user: User;
}>();

const router = useRouter();

function handleClick() {
  router.push(`/users/${props.user.id}`);
}
</script>

<template>
  <div
    class="flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 transition-colors hover:bg-gray-50"
    @click="handleClick"
  >
    <div class="flex items-center gap-4">
      <div class="bg-primary/10 text-primary h-12 w-12 flex items-center justify-center rounded-full text-xl font-bold">
        {{ user.name[0].toUpperCase() }}
      </div>
      <div class="space-y-1">
        <div class="text-lg font-medium">
          {{ user.name }}
        </div>
        <div class="text-sm text-gray-500">
          {{ user.email }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div
        class="rounded-full px-3 py-1 text-sm font-medium"
        :class="user.blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
      >
        {{ user.blocked ? 'Заблокирован' : 'Активен' }}
      </div>
      <div class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
        {{ user.role === 'administrator' ? 'Администратор' : user.role === 'manager' ? 'Менеджер' : 'Клиент' }}
      </div>
    </div>
  </div>
</template>
