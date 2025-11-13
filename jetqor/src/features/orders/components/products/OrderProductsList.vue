<script setup lang="ts">
import type { OrderProductDetails } from "../../store/orderProductDistribution";
import { useOrderProductDistributionStore } from "../../store/orderProductDistribution";

defineProps<{
  products: OrderProductDetails[];
}>();

const productDistributionStore = useOrderProductDistributionStore();
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="product in products"
      :key="product.id"
      class="border border-grayscale-200 rounded-lg bg-white p-4"
      :class="{
        'border-green-300 bg-green-50': productDistributionStore.getTotalDistributedCount(product.id) >= product.orderCount,
      }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded bg-grayscale-100" />
          <div>
            <div class="font-semibold">
              {{ product.name }}
            </div>
            <div class="text-sm text-grey">
              Артикул: {{ product.article }}
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-sm">
            {{ product.orderCount }} шт.
          </div>
          <div
            v-if="productDistributionStore.getTotalDistributedCount(product.id) >= product.orderCount"
            class="text-green-600 text-xs"
          >
            Распределен
          </div>
        </div>
      </div>

      <!-- Show product distribution info from slot -->
      <slot name="product-info" :product="product" />
    </div>
  </div>
</template>
