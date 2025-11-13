<script lang="ts" setup>
import type { Entite } from "../types";

defineProps<{
  entite: Entite;
}>();
</script>

<template>
  <RouterLink :to="`products/${entite?.product?.id}`" class="mt-6 h-34.5 flex gap-6 rounded-4 bg-white p4">
    <div class="flex-1">
      <div class="flex items-center">
        <img
          :src="entite.product?.photo_url"
          alt="Product Image"
          class="mr-6 size-15 rounded-4 bg-gray object-cover"
        >
        <div>
          <h3 class="text-lg text-#1E1E1E font-600">
            {{ entite.product.name }}
          </h3>
          <p class="text-lg text-#1E1E1E font-500">
            {{ entite.product.price }}
          </p>
        </div>
      </div>
      <div class="mt-4 flex gap-1.5 fw-500">
        <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-3 text-#1E1E1E">
          <div class="i-jq-document text-4 text-second" />
          Артикул: {{ entite.product.article }}
        </span>
        <span class="flex items-center gap-1.5 rounded-1 bg-grayscale-100 p2 text-0.875rem">
          <div class="i-jq-card-box-filled text-4 text-#1E1E1E" />
          {{ entite.count }}
        </span>
      </div>
    </div>

    <div class="h-full w-1px bg-grayscale-100" />
    <BaseButton class="ml-auto mt-auto rounded-lg bg-orange-500 px-6 py-3 text-white">
      К товару
    </BaseButton>
  </RouterLink>
</template>

<style>

</style>
