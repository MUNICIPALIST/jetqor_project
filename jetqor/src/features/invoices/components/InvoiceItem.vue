<script setup lang="ts">
import type { Invoice } from "../types";
import { computed } from "vue";

import { useRouter } from "vue-router";

import BaseButton from "@/components/ui/BaseButton/index.vue";

interface Props {
  invoice: Invoice;
}

const props = defineProps<Props>();

const typeColor = computed(() => {
  switch (props.invoice.type) {
    case "incoming":
      return {
        bg: "bg-[rgba(74,175,87,0.1)]",
        text: "text-[#4AAF57]",
      };
    case "consumable":
      return {
        bg: "bg-[rgba(255,152,31,0.1)]",
        text: "text-[#FF981F]",
      };
    case "internal":
      return {
        bg: "bg-[rgba(122,85,72,0.1)]",
        text: "text-[#7A5548]",
      };
    case "return":
      return {
        bg: "bg-[rgba(245,67,54,0.1)]",
        text: "text-[#F54336]",
      };
    default:
      return {
        bg: "bg-grayscale-100",
        text: "text-grey",
      };
  }
});

const typeLabel = computed(() => {
  switch (props.invoice.type) {
    case "incoming":
      return "Приходная";
    case "consumable":
      return "Расходная";
    case "internal":
      return "Внутренняя";
    case "return":
      return "Возвратная";
    default:
      return "Неизвестный тип";
  }
});

const invoiceStatuses = [
  { id: "all", label: "Все" },
  { id: "pending", label: "В ожидании" },
  { id: "processing", label: "В процессе" },
  { id: "completed", label: "Выполнено" },
];

const invoiceStatus = computed(() => {
  switch (props.invoice.status) {
    case "created":
      return "Созданный";
    case "approved":
      return "Одобренный";
    case "declined":
      return "Отклоненный";
    case "indelivery":
      return "В доставке";
    case "Выполнен":
      return "Выполненный";
    default:
      return props.invoice.status;
  }
});

function handleDownload() {
  // TODO: Implement download
  console.warn("Download invoice", props.invoice.id);
}

const router = useRouter();

function handleDetails() {
  router.push(`/invoices/${props.invoice.id}`);
}
</script>

<template>
  <div
    class="flex cursor-pointer gap-6 border border-grayscale-200 rounded-2xl bg-white p-6 transition-colors hover:border-main"
    @click="handleDetails"
  >
    <div class="flex flex-1 flex-col gap-3">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <h3 class="text-lg text-[#1E1E1E] font-semibold leading-[1.4em] tracking-[1.1%]">
          № {{ invoice.id }}
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <!-- Type -->
          <div
            class="h-[40px] flex items-center rounded px-2.5 py-2"
            :class="[typeColor.bg]"
          >
            <span class="text-sm font-medium leading-[1.4em] tracking-[1.4%]" :class="[typeColor.text]">
              {{ typeLabel }}
            </span>
          </div>

          <!-- Status -->
          <div class="h-[40px] flex items-center rounded bg-green px-2.5 py-2">
            <span class="text-sm text-white font-medium leading-[1.4em] tracking-[1.4%]">
              {{ invoiceStatus }}
            </span>
          </div>

          <!-- Marketplace -->
          <div
            v-if="invoice.marketplace"
            class="h-[40px] w-20 flex items-center rounded bg-grayscale-100 px-2.5 py-2"
          >
            <img
              :src="`/platforms/${invoice.marketplace.type}.svg`"
              :alt="invoice.marketplace.type"
              class="size-full object-contain object-center"
            >
          </div>

          <!-- Items count -->
          <div class="h-[40px] flex items-center gap-1 rounded bg-grayscale-100 px-2 py-2">
            <span class="i-jq-bag h-4 w-4" />
            <span class="text-sm font-medium leading-[1.4em] tracking-[1.4%]">
              {{ invoice.items }}
            </span>
          </div>

          <!-- Warehouse -->
          <div class="h-[40px] flex items-center gap-1 rounded bg-grayscale-100 px-2 py-2">
            <span class="i-jq-location h-4 w-4" />
            <span class="text-sm font-medium leading-[1.4em] tracking-[1.4%]">
              {{ invoice?.storage?.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px w-full bg-grayscale-100" />

      <!-- Info -->
      <div class="flex flex-wrap gap-x-6 gap-y-3">
        <div class="min-w-[200px] flex basis-[calc(25%-18px)] items-center gap-2">
          <span class="i-jq-calendar h-5 w-5 text-second" />
          <span class="text-xs text-[#1E1E1E] font-medium leading-[1.21em] tracking-[1.67%]">
            Дата создания: {{ invoice?.createdAt }}
          </span>
        </div>

        <div class="min-w-[200px] flex basis-[calc(25%-18px)] items-center gap-2">
          <span class="i-jq-location h-5 w-5 text-second" />
          <span class="text-xs text-[#1E1E1E] font-medium leading-[1.21em] tracking-[1.67%]">
            {{ invoice?.storage?.city }}
          </span>
        </div>

        <div class="min-w-[200px] flex basis-[calc(25%-18px)] items-center gap-2">
          <span class="i-jq-user h-5 w-5 text-second" />
          <span class="text-xs text-[#1E1E1E] font-medium leading-[1.21em] tracking-[1.67%]">
            Клиент: {{ invoice?.owner?.name }}
          </span>
        </div>

        <div class="min-w-[200px] flex basis-[calc(25%-18px)] items-center gap-2">
          <span class="i-jq-user h-5 w-5 text-second" />
          <span class="text-xs text-[#1E1E1E] font-medium leading-[1.21em] tracking-[1.67%]">
            Ответственный: {{ invoice?.responsible }}
          </span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-full w-px bg-grayscale-100" />

    <!-- Actions -->
    <div class="flex flex-col justify-between gap-3">
      <button
        class="h-[30px] flex items-center gap-2 rounded bg-grayscale-100 px-2 py-2"
        @click.stop="handleDownload"
      >
        <span class="i-jq-download h-4 w-4 text-main" />
        <span class="text-sm text-main font-medium leading-[1.4em] tracking-[1.4%]">
          Скачать накладную
        </span>
      </button>

      <BaseButton variant="primary" @click.stop="handleDetails">
        Подробнее
      </BaseButton>
    </div>
  </div>
</template>
