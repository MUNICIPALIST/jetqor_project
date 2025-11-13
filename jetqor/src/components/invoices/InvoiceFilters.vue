<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["update:type", "update:status"]);

const invoiceTypes = [
  { id: "all", label: "Все" },
  { id: "incoming", label: "Приходная" },
  { id: "consumable", label: "Расходная" },
  { id: "internal", label: "Внутренняя" },
  { id: "return", label: "Возвратная" },
];

const invoiceStatuses = [
  { id: "all", label: "Все" },
  { id: "created", label: "В ожидании" },
  { id: "approved", label: "В процессе" },
  { id: "indelivery", label: "В доставке" },
  { id: "declined", label: "Отклонено" },
];

const selectedType = ref("all");
const selectedStatus = ref("all");

watch(selectedType, (newType) => {
  emit("update:type", newType);
});
watch(selectedStatus, (newStatus) => {
  emit("update:status", newStatus);
});
</script>

<template>
  <div class="flex flex-col justify-between gap-4 md:flex-row">
    <!-- Тип накладной -->
    <div class="flex gap-1 border border-grayscale-100 rounded-xl bg-white p-1">
      <button
        v-for="type in invoiceTypes"
        :key="type.id"
        class="flex-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm leading-[1.4em] tracking-[1.4%] transition-colors"
        :class="[
          selectedType === type.id
            ? 'bg-grayscale-100 font-semibold text-black'
            : 'bg-white font-normal text-grey',
        ]"
        @click="selectedType = type.id"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Статус -->
    <div class="flex gap-1 border border-grayscale-100 rounded-xl bg-white p-1">
      <button
        v-for="status in invoiceStatuses"
        :key="status.id"
        class="flex-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm leading-[1.4em] tracking-[1.4%] transition-colors"
        :class="[
          selectedStatus === status.id
            ? 'bg-grayscale-100 font-semibold text-black'
            : 'bg-white font-normal text-grey',
        ]"
        @click="selectedStatus = status.id"
      >
        {{ status.label }}
      </button>
    </div>
  </div>
</template>
