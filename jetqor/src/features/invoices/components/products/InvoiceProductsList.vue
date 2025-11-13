<script setup lang="ts">
import type { InvoiceProductDetails } from "../../types";

defineProps<{
  products: InvoiceProductDetails[];
}>();
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-xl font-bold">
      Указанные товары в накладной
    </h2>

    <!-- Product List -->
    <div class="space-y-3">
      <div
        v-for="product in products"
        :key="product.id"
        class="border border-grayscale-200 rounded-2xl bg-white p-5"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-md bg-grayscale-100" />
            <div class="space-y-1">
              <div class="text-sm font-semibold">
                {{ product.name }}
              </div>
              <div class="text-sm text-grey">
                {{ product.price }}
              </div>
            </div>
          </div>
          <button class="i-jq-chevron-right h-5 w-5" />
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <div class="flex items-center gap-2 rounded bg-grayscale-100 px-2 py-1.5">
            <span class="i-jq-document h-4 w-4" />
            <span class="text-xs font-medium">Артикул: {{ product.article }}</span>
          </div>
          <div class="flex items-center gap-2 rounded bg-grayscale-100 px-2 py-1.5">
            <span class="i-jq-location h-4 w-4" />
            <span class="text-xs font-medium">{{ product.invoiceCount }} шт.</span>
          </div>
        </div>

        <!-- Slot for product distribution info -->
        <div class="mt-3 border-t border-grayscale-100 pt-3">
          <slot name="product-info" :product="product" />
        </div>
      </div>
    </div>
  </div>
</template>
