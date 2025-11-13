<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import ProductCardDetailedInfoItem from "@/features/products/components/ProductCardDetailedInfoItem.vue";
import useUser from "@/features/user/composables/useUser";
import UserStatusChip from "@/features/users/components/UserStatusChip.vue";
import { useDeleteUserModal } from "@/features/users/composables/useDeleteUserModal";
import { useEditUserModal } from "@/features/users/composables/useEditUserModal";
import { useUserQuery, useUsersQuery } from "@/features/users/queries/users";
import api from "@/plugins/api";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const { user: currentUser } = useUser();
const { data: user, isLoading, refetch } = useUserQuery();

const isAdmin = computed(() => currentUser.value?.role === "administrator");
const { openModal: openEditModal } = useEditUserModal();

function handleEdit() {
  if (!user.value || !isAdmin.value)
    return;
  openEditModal(user.value);
}

async function handleBlock() {
  if (!user.value || !isAdmin.value)
    return;

  try {
    await api("/user/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: user.value.id,
        blocked: !user.value.blocked,
      },
    });

    // Обновляем данные пользователя после блокировки/разблокировки
    await refetch();
  }
  catch (error) {
    console.error("Error blocking/unblocking user:", error);
  }
}

const router = useRouter();
const isDeleting = ref(false);
const { refetch: refetchUsers } = useUsersQuery();
const { openModal } = useDeleteUserModal();

async function handleDelete() {
  if (!user.value || !isAdmin.value)
    return;

  openModal(user.value.name, async () => {
    try {
      isDeleting.value = true;
      await api("/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: {
          id: Number(user.value?.id),
        },
      });

      // Обновляем список пользователей и перенаправляем
      await refetchUsers();
      router.push("/users");
    }
    catch (error) {
      console.error("Error deleting user:", error);
    }
    finally {
      isDeleting.value = false;
    }
  });
}

function getRoleLabel(role: string) {
  switch (role) {
    case "administrator":
      return "Администратор";
    case "manager":
      return "Менеджер";
    case "client":
      return "Клиент";
    default:
      return role;
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="rounded-xl bg-white p-6">
      <div v-if="isLoading" class="p-4 text-center">
        Загрузка...
      </div>
      <div v-else-if="!user" class="p-4 text-center">
        Пользователь не найден
      </div>
      <div v-else class="flex justify-between">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl text-second font-bold">
              {{ user.name }}
            </h1>
            <UserStatusChip :role="user.role" :blocked="user.blocked" />
          </div>
          <div class="flex items-center gap-2">
            <span class="i-jq-calendar h-5 w-5 text-second" />
            <span class="text-base text-grey">
              Дата регистрации: {{ new Date(user.created_at).toLocaleDateString() }}
            </span>
          </div>
        </div>
        <div v-if="isAdmin" class="flex items-center gap-3">
          <BaseButton variant="secondary" @click="handleEdit">
            <div class="i-jq-edit-filled mr-2 h-5 w-5" />
            Редактировать
          </BaseButton>
          <BaseButton variant="error-outline" @click="handleBlock">
            {{ user.blocked ? 'Разблокировать' : 'Заблокировать' }}
          </BaseButton>
          <BaseButton
            variant="error-outline"
            :loading="isDeleting"
            @click="handleDelete"
          >
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="rounded-xl bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg text-second font-semibold">
          О пользователе
        </h2>
      </div>

      <div v-if="user" class="grid grid-cols-2 gap-3">
        <ProductCardDetailedInfoItem title="Имя" :value="user.name" />
        <ProductCardDetailedInfoItem title="Роль" :value="getRoleLabel(user.role)" />
        <ProductCardDetailedInfoItem title="Email" :value="user.email" />
        <ProductCardDetailedInfoItem title="Телефон" :value="user.phone" />
        <ProductCardDetailedInfoItem
          title="Дата регистрации"
          :value="new Date(user.created_at).toLocaleDateString()"
        />
        <ProductCardDetailedInfoItem
          title="Статус"
          :value="user.blocked ? 'Заблокирован' : 'Активен'"
        />
      </div>
    </div>

    <!-- Statistics -->
    <div v-if="user" class="rounded-xl bg-white p-6">
      <h2 class="mb-6 text-lg text-second font-bold">
        Статистика
      </h2>
      <div class="grid grid-cols-3 gap-6">
        <div class="rounded-xl bg-grayscale-100 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-second font-medium">Товаров</span>
            <span class="i-jq-bag h-5 w-5 text-main" />
          </div>
          <div class="text-2xl text-second font-bold">
            {{ user.products.length }}
          </div>
        </div>
        <div class="rounded-xl bg-grayscale-100 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-second font-medium">Накладных</span>
            <span class="i-jq-category h-5 w-5 text-main" />
          </div>
          <div class="text-2xl text-second font-bold">
            {{ user.invoices.length }}
          </div>
        </div>
        <div class="rounded-xl bg-grayscale-100 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-second font-medium">Уведомлений</span>
            <span class="i-jq-wallet h-5 w-5 text-main" />
          </div>
          <div class="text-2xl text-second font-bold">
            {{ user.notifications.length }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: default
</route>
