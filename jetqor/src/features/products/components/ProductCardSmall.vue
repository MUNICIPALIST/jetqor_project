<script lang="ts" setup>
import type { Product } from "../types";

defineProps<{
  product: Product;
}>();

const isImageError = ref(false);
</script>

<template>
  <RouterLink
    :to="`/products/${product.id}`"
    class="gap-2 border border-grayscale-200 rounded-4 bg-grayscale-100 p5 hover:bg-grayscale-200"
  >
    <div class="flex items-center">
      <img
        v-if="product?.photo_url && !isImageError"
        :src="product?.photo_url"
        alt="Product Image"
        class="mr-3 size-10 rounded-1.5 object-cover"
        :class="{
          'bg-green': !product.expired,
          'bg-red': product.expired,
        }"
        @error="isImageError = true"
      >
      <div v-else class="mr-3 size-10 flex items-center justify-center rounded-1.5 bg-gray-100 object-cover">
        <div class="i-jq-bag text-6 text-[#EA6001]" />
      </div>
      <div>
        <h3 class="text-3.5 text-#1E1E1E font-600">
          {{ product.name }}
        </h3>
        <p class="text-3.5 text-#1E1E1E font-500">
          {{ product.price }}
        </p>
      </div>

      <div class="ml-auto aspect-square h-full w-fit flex items-center justify-center">
        <div class="i-jq-chevron-right text-#ABACAE" />
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5 fw-500">
      <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-50 p2 text-3 text-#1E1E1E">
        <div class="i-jq-document text-4 text-second" />
        Артикул: {{ product.article }}
      </span>
      <span
        class="flex items-center gap-2 rounded-1 px-2.5 py-2 text-0.875rem"
        :class="[
          {
            'bg-#F543361A text-other-red': product.expired,
            'bg-#4AAF571A text-other-green': !product.expired,
          },
        ]"
      >
        {{ product.status }}
      </span>
      <span class="flex items-center gap-2 rounded-1 bg-grayscale-50 px-2.5 py-2 text-0.875rem">
        Продаж: {{ product.sales }}/мес.
      </span>
      <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-50 p2 text-0.875rem">
        <div class="i-jq-card-box-filled text-4 text-#1E1E1E" />
        Склад А: {{ product.stockA }}
      </span>
      <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-50 p2 text-0.875rem">
        <div class="i-jq-card-box-filled text-4 text-#1E1E1E" />
        Склад B: {{ product.stockB }}
      </span>
    </div>
  </RouterLink>
</template>

<style>

</style>
