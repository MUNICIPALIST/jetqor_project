<script lang="ts" setup>
import { computed, ref } from "vue";
import api from "~/plugins/api";

const loading = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const passwordRequirements = ref([
  { text: "Не менее 8 символов", status: "default", regex: /.{8,}/ },
  { text: "Цифры", status: "default", regex: /\d/ },
  { text: "Заглавные и строчные буквы", status: "default", regex: /(?=.*[a-z])(?=.*[A-Z])/ },
]);

function checkPasswordRequirements(password: string): void {
  passwordRequirements.value = passwordRequirements.value.map(req => ({
    ...req,
    status: req.regex.test(password) ? "success" : "error",
  }));
}

function validatePassword(): void {
  if (!newPassword.value) {
    passwordRequirements.value = passwordRequirements.value.map(req => ({
      ...req,
      status: "default",
    }));
    return;
  }
  checkPasswordRequirements(newPassword.value);
}

const isNewPasswordValid = computed(() => {
  return passwordRequirements.value.every(req => req.status === "success");
});

const isConfirmPasswordValid = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value;
});

const canSubmit = computed(() => {
  return currentPassword.value && isNewPasswordValid.value && isConfirmPasswordValid.value;
});

async function handleChangePassword(): Promise<void> {
  if (!canSubmit.value)
    return;

  loading.value = true;
  try {
    await api("/settings/change_password", {
      method: "POST",
      body: {
        old_password: currentPassword.value,
        new_password: newPassword.value,
      },
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.warn("Пароль успешно изменен");

    // Очищаем поля
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";

    // Сбрасываем валидацию
    passwordRequirements.value = passwordRequirements.value.map(req => ({
      ...req,
      status: "default",
    }));
  }
  catch (error) {
    console.error("Ошибка при смене пароля:", error);
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="heading-4">
        Сменить пароль
      </h1>
      <BaseButton
        size="long"
        variant="primary"
        class="!h-12"
        :loading="loading"
        :disabled="!canSubmit"
        @click="handleChangePassword"
      >
        Сменить пароль
      </BaseButton>
    </div>

    <div class="grid grid-cols-3 mb-6 gap-5">
      <div class="flex-1">
        <AppInput
          v-model="currentPassword"
          type="password"
          label="Текущий пароль"
          placeholder="Введите текущий пароль"
        />
      </div>

      <div class="flex-1">
        <AppInput
          v-model="newPassword"
          type="password"
          label="Новый пароль"
          placeholder="Введите новый пароль"
          @input="validatePassword"
        />
      </div>

      <div class="flex-1">
        <AppInput
          v-model="confirmPassword"
          type="password"
          label="Подтвердите пароль"
          placeholder="Введите новый пароль еще раз"
          :error="!isConfirmPasswordValid && confirmPassword !== '' ? 'Пароли не совпадают' : ''"
        />
      </div>
    </div>

    <div>
      <p class="mb-3 text-base font-medium leading-[1.4em] tracking-[1.25%]">
        Пароль должен содержать:
      </p>
      <div class="flex flex-col gap-1.5">
        <div
          v-for="requirement in passwordRequirements"
          :key="requirement.text"
          class="w-fit flex items-center gap-1 border border-grayscale-300 rounded-[200px] p-2"
        >
          <div
            class="size-2 rounded-full"
            :class="{
              'bg-grayscale-300': requirement.status === 'default',
              'bg-blue': requirement.status === 'success',
              'bg-red': requirement.status === 'error',
            }"
          />
          <div class="text-xs font-medium leading-[1.213em] tracking-[1.67%]">
            {{ requirement.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
name: settings-password
meta:
  layout: settings
</route>
