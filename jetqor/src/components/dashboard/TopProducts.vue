<script setup lang="ts">
const products = [
  { id: 1, name: "Товар-1" },
  { id: 2, name: "Товар-2" },
  { id: 3, name: "Товар-3" },
  { id: 4, name: "Товар-4" },
  { id: 5, name: "Товар-5" },
];
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <h3 class="mb-4 heading-4 text-second">
      ТОП-5 самых продаваемых товаров
    </h3>
    <div class="flex flex-col gap-2">
      <button
        v-for="product in products"
        :key="product.id"
        class="flex items-center justify-between rounded-lg bg-background p-4 transition-colors hover:bg-gray-100"
      >
        <span>{{ product.name }}</span>
        <span class="i-jq-chevron-right text-gray-400" />
      </button>
    </div>
  </div>
</template>
