<script setup lang="ts">
import type { UserRole } from "@/features/users/types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import UserItem from "@/features/users/components/UserItem.vue";
import { useAddUserModal } from "@/features/users/composables/useAddUserModal";
import { useUsersQuery } from "@/features/users/queries/users";
import { computed, ref } from "vue";
import SearchBar from "~/components/SearchBar.vue";

const { data: users, isLoading } = useUsersQuery();

// Filters
const searchQuery = ref("");
const selectedRole = ref<"all" | UserRole>("all");
const selectedBlocked = ref<"all" | "active" | "blocked">("all");

const roles = [
  { value: "all", label: "Все" },
  { value: "client", label: "Клиент" },
  { value: "manager", label: "Менеджер" },
  { value: "administrator", label: "Администратор" },
] as const;

const statuses = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "blocked", label: "Заблокированные" },
] as const;

const filteredUsers = computed(() => {
  if (!users.value)
    return [];

  return users.value.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = selectedRole.value === "all" || user.role === selectedRole.value;
    const matchesStatus = selectedBlocked.value === "all"
      || (selectedBlocked.value === "blocked" ? user.blocked : !user.blocked);

    return matchesSearch && matchesRole && matchesStatus;
  });
});

const { openModal } = useAddUserModal();

function handleAddUser() {
  openModal();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Search & Filters -->
    <div class="flex gap-4 rounded-xl bg-white p-3">
      <div class="flex flex-1 items-center gap-2 rounded-xl px-3">
        <span class="i-jq-search h-5 w-5 text-[#ABACAE]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Введите имя..."
          class="flex-1 bg-transparent p-2 text-base outline-none"
        >
      </div>
      <BaseButton variant="primary" @click="handleAddUser">
        <span class="i-jq-plus-filled h-4 w-4" />
        Добавить пользователя
      </BaseButton>
    </div>

    <!-- Filter Tabs -->
    <div class="flex justify-between">
      <!-- Role filter -->
      <div class="flex border border-[#F5F5F5] rounded-xl bg-white p-1">
        <button
          v-for="role in roles"
          :key="role.value"
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="[
            selectedRole === role.value
              ? 'bg-[#F5F5F5] text-black'
              : 'text-[#ABACAE] hover:text-black',
          ]"
          @click="selectedRole = role.value"
        >
          {{ role.label }}
        </button>
      </div>

      <!-- Status filter -->
      <div class="flex border border-[#F5F5F5] rounded-xl bg-white p-1">
        <button
          v-for="status in statuses"
          :key="status.value"
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="[
            selectedBlocked === status.value
              ? 'bg-[#F5F5F5] text-black'
              : 'text-[#ABACAE] hover:text-black',
          ]"
          @click="selectedBlocked = status.value"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- Users List -->
    <div v-if="isLoading" class="p-4 text-center">
      Загрузка...
    </div>
    <div v-else-if="!filteredUsers.length" class="p-4 text-center">
      Пользователи не найдены
    </div>
    <div v-else class="space-y-3">
      <UserItem
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
      />
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: default
</route>
