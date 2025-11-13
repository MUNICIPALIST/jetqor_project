<script setup lang="ts">
import type { Product } from "../types";
import BaseButton from "@/components/ui/BaseButton/index.vue";

const props = defineProps<{
  product: Product;
}>();

const productWeight = computed(() => {
  if (!props.product?.weight)
    return null;
  return (props.product.weight / 1000).toFixed(2);
});

const isImageError = ref(false);
</script>

<template>
  <RouterLink
    class="mb-6 flex items-center border border-#EEEEEE rounded-lg bg-white p-6"
    :to="`/products/${product.id}`"
  >
    <div class="flex-1">
      <div class="flex items-center">
        <img
          v-if="product.photo_url && !isImageError"
          :src="product.photo_url"
          alt="Product Image"
          class="mr-6 size-15 rounded-4 bg-gray-100 object-cover"
          @error="isImageError = true"
        >
        <div v-else class="mr-6 size-15 flex items-center justify-center rounded-4 bg-gray-100 object-cover">
          <div class="i-jq-bag text-6 text-[#EA6001]" />
        </div>
        <div>
          <h3 class="text-lg text-#1E1E1E font-600">
            {{ product.name }}
          </h3>
          <p class="text-lg text-#1E1E1E font-500">
            Продажи: {{ product.sells_count_month }}/мес.
          </p>
        </div>
      </div>
      <div class="mt-4 flex gap-1.5 fw-500">
        <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-3 text-#1E1E1E">
          <div class="i-jq-document text-4 text-second" />
          Артикул: {{ product.article }}
        </span>

        <span v-if="product.best_seller" class="flex items-center gap-2 rounded-1 bg-[#FFEDD5] px-2.5 py-2 text-0.875rem text-[#EA6001]">
          Хит продаж
        </span>

        <!-- Marketplace Integrations -->
        <div class="flex gap-2">
          <img
            v-if="product.integration_kaspi"
            src="/platforms/kaspi.svg"
            alt="Kaspi"
            class="h-6 w-6"
          >
          <img
            v-if="product.integration_wildberries"
            src="/platforms/wildberries.svg"
            alt="Wildberries"
            class="h-6 w-6"
          >
          <img
            v-if="product.integration_ozon"
            src="/platforms/ozon.svg"
            alt="Ozon"
            class="h-6 w-6"
          >
        </div>

        <!-- Product Dimensions -->
        <div v-if="product.volume || product.weight" class="flex gap-2">
          <span v-if="product.volume" class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-0.875rem">
            <div class="i-jq-card-box-filled text-4 text-#1E1E1E" />
            Объем: {{ product.volume }} м³
          </span>
          <span v-if="product.weight" class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-0.875rem">
            <div class="i-jq-activity text-4 text-#1E1E1E" />
            Вес: {{ productWeight }} кг
          </span>
        </div>
      </div>
    </div>
    <BaseButton class="ml-auto mt-auto rounded-lg bg-orange-500 px-6 py-3 text-white">
      Подробнее
    </BaseButton>
  </RouterLink>
</template>
