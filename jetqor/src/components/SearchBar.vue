<script lang="ts" setup>
import { useDebounceFn } from "@vueuse/core";
import { ref } from "vue";

const modelValue = defineModel<string>();
const showFilters = ref(false);

const debouncedSearch = useDebounceFn((value: string) => {
  modelValue.value = value;
}, 300);

const localSearch = ref(modelValue.value || "");

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  localSearch.value = value;
  debouncedSearch(value);
}

function toggleFilters() {
  showFilters.value = !showFilters.value;
}
</script>

<template>
  <div class="w-full rounded-4 bg-white p3">
    <div class="w-full flex gap-4 h-20">
      <div
        class="flex flex-1 items-center"
      >
        <div class="i-jq-search ml-4 size-7 text-#E0E0E0" />
        <input
          v-model="localSearch"
          type="text"
          placeholder="Введите наименование товара, артикул..."
          class="h-5 flex-1 border-none bg-transparent px-4 leading-none outline-none placeholder:translate-y-0.1rem focus:border-none placeholder:text-4 placeholder:leading-none focus:ring-0"
          @input="onInput"
        >
        <!-- <AppButton
          class="h-full flex cursor-pointer items-center px-4 transition-colors duration-200"
          @click="toggleFilters"
        >
          <div class="i-jq-filter text-second" />
        </AppButton> -->
      </div>
      <!-- <BaseButton
        size="long"
      >
        Найти - 17 234
      </BaseButton> -->
    </div>
  </div>
</template>
