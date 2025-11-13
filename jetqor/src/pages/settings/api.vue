<script lang="ts" setup>
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { useAddApiKeyModal } from "~/features/settings/composables/useAddApiKeyModal";
import { getUser } from "~/features/user/queries/user";

const currentDate = ref(new Date().toLocaleDateString("ru-RU"));
const { openModal } = useAddApiKeyModal();
const { data: user, refetch } = getUser();

function handleUpdateSuccess() {
  refetch();
}

interface Marketplace {
  name: string;
  icon: string;
  apiKey?: string;
}

const marketplace = ref<Marketplace>({
  name: "Kaspi",
  icon: "kaspi",
});

const maskedKaspiKey = computed(() => {
  if (!user.value?.kaspi_key)
    return "";
  return user.value.kaspi_key.substring(0, 4) + "*".repeat(user.value.kaspi_key.length - 4);
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Заголовок -->
    <div class="rounded-xl bg-white">
      <div class="p-6">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl text-black font-bold leading-[1.6em]">
              Подключенные API ключи
            </h1>
            <BaseButton
              variant="primary"
              size="long"
              class="!h-12"
              @click="openModal(handleUpdateSuccess)"
            >
              <div class="flex items-center gap-3">
                <span class="i-jq-download h-4 w-4 text-main" />
                <span>Создать новый API</span>
              </div>
            </BaseButton>
          </div>
          <div class="flex items-center gap-2">
            <span class="i-jq-calendar size-6 text-grey" />
            <span class="text-base text-grey font-normal leading-[1.4em] tracking-[1.25%]">
              Дата актуальности:
            </span>
            <div class="rounded-[6px] bg-[#FAFAFA] px-2.5 py-[7px]">
              <span class="text-xs text-[#00848C] font-semibold leading-[1.225em] tracking-[1.67%]">{{ currentDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kaspi -->
    <div class="flex flex-col gap-4">
      <div class="relative flex items-center justify-between border border-grayscale-200 rounded-2xl bg-white p-6">
        <div class="flex flex-col justify-center gap-4">
          <div class="flex items-center gap-3">
            <span class="text-[18px] text-[#1E1E1E] font-semibold leading-[1.4em] tracking-[1.11%]">
              {{ marketplace.name }}
            </span>
          </div>
          <div class="flex gap-1.5">
            <div v-if="user?.kaspi_key" class="flex items-center gap-1.5 rounded bg-[#F5F5F5] px-2 py-2">
              <div class="i-jq-message size-4 text-[#1E1E1E]" />
              <span class="align-middle text-xs text-[#1E1E1E] font-medium leading-[1.21em] tracking-[1.67%] uppercase">
                API: {{ maskedKaspiKey }}
              </span>
            </div>
            <div class="flex items-center rounded bg-[#F5F5F5] p-[5px]">
              <img
                src="/platforms/kaspi.svg"
                alt="Kaspi"
                class="h-6 w-22.5 object-contain"
              >
            </div>
          </div>
        </div>

        <BaseButton
          size="long"
          variant="primary"
          class="!h-12"
          @click="openModal(handleUpdateSuccess)"
        >
          {{ user?.kaspi_key ? 'Редактировать' : 'Вписать API' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
name: settings-api
meta:
  layout: settings
</route>
