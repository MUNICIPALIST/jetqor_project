<script lang="ts" setup>
import { getProduct } from "~/features/products/queries/products";
import OrderCardProductItem from "./OrderCardProductItem.vue";

const props = defineProps<{
  products: any;
}>();

const isOpen = ref(true);

const _products = ref([]);
async function getProducts() {
  try {
    if (!props.products || !props.products.length) {
      _products.value = [];
      return;
    }

    const productPromises = props.products.map((product: any) =>
      getProduct(product.id),
    );

    _products.value = await Promise.all(productPromises);
  }
  catch (error) {
    console.error("Failed to fetch products:", error);
    _products.value = [];
  }
}

onMounted(() => {
  getProducts();
});
</script>

<template>
  <UIPanel v-model="isOpen">
    <template #header>
      Товар (ы)
    </template>

    <div v-if="_products?.length > 0" class="flex flex-col gap-3">
      <OrderCardProductItem v-for="product in _products" :key="product.id" :product="product" />
    </div>
  </UIPanel>
</template>

<style>

</style>
