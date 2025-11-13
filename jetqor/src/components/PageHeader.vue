<script lang="ts" setup>
import Date from "./ui/Date.vue";

const props = defineProps<{
  title: string;
  date: string;
  onDownload: () => void;
}>();
</script>

<template>
  <div class="mb-6 flex items-center justify-between rounded-3 bg-white p6">
    <div class="flex flex-col items-start justify-center gap-12px">
      <h1 class="text-2xl font-bold">
        {{ title }}
      </h1>
      <div class="flex items-center text-#ABACAE">
        <span class="i-jq-calendar mr-2 size-6" />
        <span class="text-4 fw-400 tracking-0.2px">Дата актуальности:</span>
        <!-- <Date class="ml-2" :date="date" /> -->
      </div>
    </div>
    <div class="flex flex-col items-end justify-end gap-12px">
      <BaseButton icon="i-jq-download" @click="props.onDownload">
        Скачать отчет
      </BaseButton>
      <div class="text-1rem text-#ABACAE fw-400 tracking-0.2px">
        Отчет может формироваться из ваших фильтров
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any necessary styles here */
</style>
