<script setup lang="ts">
import type { User } from "~/types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
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

// Split user name into components
const nameParts = props.user.name.split(" ");
const lastName = nameParts[0] || "";
const firstName = nameParts[1] || "";
const middleName = nameParts[2] || "";

const formData = ref({
  name: `${lastName} ${firstName} ${middleName}`.trim(),
  email: props.user.email,
  phone: props.user.phone,
});

const errors = ref({
  name: "",
  email: "",
  phone: "",
});

const isLoading = ref(false);

async function handleSubmit() {
  // Reset errors
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  // Validate
  let hasError = false;
  if (!formData.value.name) {
    errors.value.name = "Введите ФИО";
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

  if (hasError)
    return;

  try {
    isLoading.value = true;

    // Send the complete user object with our changes
    const response = await api("/user/update", {
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
        role: props.user.role, // Keep the existing role
      },
    });

    if (response) {
      emit("updated");
      emit("close");
    }
  }
  catch (error) {
    console.error("Error updating profile:", error);
  }
  finally {
    isLoading.value = false;
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
        Редактирование профиля
      </h2>
      <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
        <div class="i-jq-close h-6 w-6" />
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- ФИО -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">ФИО</label>
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

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton variant="secondary" @click="emit('close')">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" type="submit" :loading="isLoading">
          Сохранить
        </BaseButton>
      </div>
    </form>
  </VueFinalModal>
</template>
