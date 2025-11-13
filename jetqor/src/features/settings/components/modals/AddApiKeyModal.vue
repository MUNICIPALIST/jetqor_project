<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import api from "~/plugins/api";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const apiKey = ref("");
const loading = ref(false);

async function handleSubmit() {
  if (!apiKey.value)
    return;

  loading.value = true;
  try {
    await api("/settings/kaspi_key", {
      method: "POST",
      body: {
        kaspi_key: apiKey.value,
      },
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    emit("success");
    console.warn("API ключ успешно добавлен");
  }
  catch (error) {
    console.error("Ошибка при добавлении API ключа:", error);
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative flex flex-col max-w-xl w-full mx-4 p-6 bg-white rounded-lg border border-grayscale-200"
    overlay-class="bg-black/40"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
    :click-to-close="true"
  >
    <div class="mb-4 flex items-center gap-6">
      <button class="flex items-center gap-6" @click="emit('close')">
        <div class="i-jq-chevron-up h-6 w-6 rotate--90" />
        <span class="text-lg font-semibold">Назад</span>
      </button>
    </div>

    <div class="flex flex-col items-center gap-6">
      <div class="size-[72px] flex items-center justify-center rounded-[1000px] bg-grayscale-100">
        <div class="i-jq-key size-12 text-main" />
      </div>

      <div class="text-center">
        <h2 class="text-lg font-semibold">
          Впишите API ключ - Kaspi
        </h2>
      </div>

      <div class="w-full rounded-2xl bg-grayscale-100 p-6">
        <AppInput
          v-model="apiKey"
          type="text"
          placeholder="Введите API"
        />
      </div>

      <BaseButton
        variant="primary"
        size="long"
        class="w-full"
        :loading="loading"
        :disabled="!apiKey"
        @click="handleSubmit"
      >
        Подтвердить
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
