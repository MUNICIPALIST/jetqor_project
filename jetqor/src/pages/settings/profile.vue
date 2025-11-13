<script lang="ts" setup>
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { useEditProfileModal } from "~/features/user/composables/useEditProfileModal";
import { getUser } from "~/features/user/queries/user";

const { data: user } = getUser();
const { openModal } = useEditProfileModal();

function formatDate(date: string | undefined) {
  if (!date)
    return "-";
  return new Date(date).toLocaleDateString("ru-RU");
}

function handleEdit() {
  if (user.value) {
    openModal(user.value);
  }
}
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="heading-4">
        Личные данные
      </h1>
      <BaseButton variant="secondary" @click="handleEdit">
        <div class="i-jq-edit-filled mr-2 size-5" />
        Редактировать
      </BaseButton>
    </div>

    <div class="flex flex-col gap-6">
      <!-- Персональные данные -->
      <div class="flex gap-5">
        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            Фамилия
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ user?.name?.split(' ')[0] || '-' }}
          </div>
        </div>

        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            Имя
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ user?.name?.split(' ')[1] || '-' }}
          </div>
        </div>

        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            Отчество
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ user?.name?.split(' ')[2] || '-' }}
          </div>
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="flex gap-5">
        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            E-mail
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ user?.email }}
          </div>
        </div>

        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            Телефон
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ user?.phone || '-' }}
          </div>
        </div>

        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            Права доступа
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ user?.role === 'administrator' ? 'Администратор' : user?.role === 'manager' ? 'Менеджер' : 'Клиент' }}
          </div>
        </div>
      </div>

      <div class="flex gap-5">
        <div class="flex-1">
          <div class="mb-3 text-sm text-grey font-semibold tracking-wider">
            Дата регистрации
          </div>
          <div class="rounded-lg bg-grayscale-100 p-3 text-sm font-semibold">
            {{ formatDate(user?.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
name: settings-profile
meta:
  layout: settings
</route>
