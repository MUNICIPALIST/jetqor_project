<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { useUsersQuery } from "@/features/users/queries/users";
import api from "@/plugins/api";
import { ref } from "vue";
import { useModal, VueFinalModal } from "vue-final-modal";
import SuccessNotificationModal from "./SuccessNotificationModal.vue";

type UserRole = "administrator" | "manager" | "client";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const { refetch } = useUsersQuery();

const form = ref({
  email: "",
  password: "",
  name: "",
  phone: "",
  role: "client" as UserRole,
});

const isLoading = ref(false);

const roles = [
  { value: "client", label: "Клиент" },
  { value: "manager", label: "Менеджер" },
  { value: "administrator", label: "Администратор" },
] as const;

async function handleCreate() {
  try {
    isLoading.value = true;

    await api("/user/create", {
      method: "POST",
      body: form.value,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    await refetch();

    const { open, close } = useModal({
      component: SuccessNotificationModal,
      attrs: {
        onClose() {
          close();
          emit("success");
        },
      },
    });

    open();
  }
  catch (error) {
    console.error("Failed to create user:", error);
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative flex flex-col max-w-xl w-full mx-4 p-6 bg-white rounded-lg"
    overlay-class="bg-black/40"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
    :click-to-close="false"
  >
    <header class="flex items-center justify-between">
      <div class="text-xl font-bold">
        Создание пользователя
      </div>
      <button class="p-1" @click="emit('close')">
        <span class="i-jq-close h-4 w-4" />
      </button>
    </header>

    <div class="mt-6 space-y-4">
      <div>
        <div class="mb-2 text-sm font-medium">
          Email*
        </div>
        <input
          v-model="form.email"
          type="email"
          placeholder="Введите email"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
        >
      </div>

      <div>
        <div class="mb-2 text-sm font-medium">
          Пароль*
        </div>
        <input
          v-model="form.password"
          type="password"
          placeholder="Введите пароль"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
        >
      </div>

      <div>
        <div class="mb-2 text-sm font-medium">
          Роль пользователя
        </div>
        <div class="flex border border-[#F5F5F5] rounded-xl bg-white p-1">
          <button
            v-for="role in roles"
            :key="role.value"
            class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="[
              form.role === role.value
                ? 'bg-[#F5F5F5] text-black'
                : 'text-[#ABACAE] hover:text-black',
            ]"
            @click="form.role = role.value"
          >
            {{ role.label }}
          </button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-sm font-medium">
          ФИО
        </div>
        <input
          v-model="form.name"
          type="text"
          placeholder="Введите ФИО"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
        >
      </div>

      <div>
        <div class="mb-2 text-sm font-medium">
          Телефон
        </div>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="Введите номер телефона"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
        >
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-4">
      <BaseButton variant="secondary" @click="emit('close')">
        Отмена
      </BaseButton>
      <BaseButton
        variant="primary"
        :loading="isLoading"
        @click="handleCreate"
      >
        Создать
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
