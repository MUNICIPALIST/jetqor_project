<script setup lang="ts">
import type { User } from "../../types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { useUserQuery, useUsersQuery } from "@/features/users/queries/users";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import api from "~/plugins/api";

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "updated"): void;
}>();

// Получаем функцию для обновления списка пользователей
const { refetch: refetchUsers } = useUsersQuery();
const { refetch: refetchUser } = useUserQuery();

const formData = ref({
  name: props.user.name,
  email: props.user.email,
  phone: props.user.phone,
  role: props.user.role,
});

const errors = ref({
  name: "",
  email: "",
  phone: "",
  role: "",
});

const roleOptions = [
  { value: "administrator", label: "Администратор" },
  { value: "manager", label: "Менеджер" },
  { value: "client", label: "Клиент" },
];

async function handleSubmit() {
  // Reset errors
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  // Validate
  let hasError = false;
  if (!formData.value.name) {
    errors.value.name = "Введите имя пользователя";
    hasError = true;
  }
  if (!formData.value.email) {
    errors.value.email = "Введите email";
    hasError = true;
  }
  if (!formData.value.phone) {
    errors.value.phone = "Введите телефон";
    hasError = true;
  }
  if (!formData.value.role) {
    errors.value.role = "Выберите роль";
    hasError = true;
  }

  if (hasError)
    return;

  try {
    const response = await api(`/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: props.user.id,
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
        role: formData.value.role,
      },
    });

    if (response) {
      // Обновляем список пользователей
      refetchUsers();
      refetchUser();

      // Уведомляем о успешном обновлении и закрываем модальное окно
      emit("updated");
      emit("close");
    }
  }
  catch (error) {
    console.error("Error updating user:", error);
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative max-w-lg w-full rounded-lg bg-white p-6"
    overlay-class="bg-black/40"
  >
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-semibold">
        Редактирование пользователя
      </h2>
      <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Имя -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Имя</label>
        <input
          v-model="formData.name"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.name }"
        >
        <p v-if="errors.name" class="text-red-500 mt-1 text-sm">
          {{ errors.name }}
        </p>
      </div>

      <!-- Email -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Email</label>
        <input
          v-model="formData.email"
          type="email"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.email }"
        >
        <p v-if="errors.email" class="text-red-500 mt-1 text-sm">
          {{ errors.email }}
        </p>
      </div>

      <!-- Телефон -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Телефон</label>
        <input
          v-model="formData.phone"
          type="tel"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.phone }"
        >
        <p v-if="errors.phone" class="text-red-500 mt-1 text-sm">
          {{ errors.phone }}
        </p>
      </div>

      <!-- Роль -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Роль</label>
        <select
          v-model="formData.role"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.role }"
        >
          <option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p v-if="errors.role" class="text-red-500 mt-1 text-sm">
          {{ errors.role }}
        </p>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton variant="secondary" @click="emit('close')">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" type="submit">
          Сохранить
        </BaseButton>
      </div>
    </form>
  </VueFinalModal>
</template>
