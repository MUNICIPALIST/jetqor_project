<script setup lang="ts">
import type { Product } from "~/features/products/types";

defineProps<{
  product: Product;
}>();

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
          class="mr-6 size-15 rounded-4 object-cover"
          :class="{
            'bg-green': !product?.expired,
            'bg-red': product?.expired,
          }"
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
            {{ product?.sells_count_month }}
          </p>
        </div>
      </div>
      <div class="mt-4 flex gap-1.5 fw-500">
        <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-3 text-#1E1E1E">
          <div class="i-jq-document text-4 text-second" />
          Артикул: {{ product.article }}
        </span>
        <span
          v-if="product?.status"
          class="flex items-center gap-2 rounded-1 px-2.5 py-2 text-0.875rem"
          :class="[
            {
              'bg-#F543361A text-other-red': product?.expired,
              'bg-#4AAF571A text-other-green': !product?.expired,
            },
          ]"
        >
          {{ product?.status }}
        </span>
        <span v-if="product?.sells_count_month" class="flex items-center gap-2 rounded-1 bg-grayscale-100 px-2.5 py-2 text-0.875rem">
          Продаж: {{ product?.sells_count_month }}/мес.
        </span>
        <span v-if="product?.stockA" class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-0.875rem">
          <div class="i-jq-card-box-filled text-4 text-#1E1E1E" />
          Склад А: {{ product?.stockA }}
        </span>
        <span v-if="product?.stockB" class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-0.875rem">
          <div class="i-jq-card-box-filled text-4 text-#1E1E1E" />
          Склад B: {{ product?.stockB }}
        </span>
      </div>
    </div>
    <BaseButton class="ml-auto mt-auto rounded-lg bg-orange-500 px-6 py-3 text-white">
      Подробнее
    </BaseButton>
  </RouterLink>
</template>
