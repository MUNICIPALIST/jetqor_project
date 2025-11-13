<script setup lang="ts">
import type { Product } from "~/features/products/types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { computed } from "vue";
import FilterTabs from "~/components/FilterTabs.vue";
import SearchBar from "~/components/SearchBar.vue";
import AppPagination from "~/components/ui/AppPagination/index.vue";
import { useAddClientInvoiceModal } from "~/features/invoices/composables/useAddClientInvoiceModal";
import ProductCard from "~/features/products/components/ProductCard.vue";
import ProductCardSkeleton from "~/features/products/components/ProductCardSkeleton.vue";
import { useCreateProductModal } from "~/features/products/composables/useCreateProductModal";
import { useProductsStore } from "~/features/products/store/product";
import { useSearchProductStore } from "~/features/products/store/search";
import useUser from "~/features/user/composables/useUser";
import { useUploadExcelModal } from "~/features/products/composables/useUploadExcelModal";

const productStore = useProductsStore();
const searchStore = useSearchProductStore();
const { user } = useUser();
const { openModal: openInvoiceModal } = useAddClientInvoiceModal();
const { openModal: openCreateProductModal } = useCreateProductModal();
const { openModal: openUploadExcelModal } = useUploadExcelModal();

const isClient = computed(() => user.value?.role === "client");

const filteredProducts = computed(() => {
  if (!productStore.products.length)
    return [];

  if (productStore.selectedTab === "all") {
    return productStore.products;
  }

  return productStore.products.filter((product: Product) => {
    // В данном случае считаем, что товар в наличии, если есть габариты
    if (productStore.selectedTab === "in_stock") {
      return product.volume > 0;
    }
    return product.volume === 0;
  });
});

function handleCreateInvoice() {
  openInvoiceModal();
}

function handleCreateProduct() {
  openCreateProductModal();
}

function handleUploadExcel() {
  openUploadExcelModal();
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="mb-2 text-2xl font-bold">
          Товары
        </h1>
        <div class="flex items-center gap-2">
          <span class="i-jq-calendar h-5 w-5 text-second" />
          <span class="text-base text-[#ABACAE]">
            Дата актуальности: {{ new Date().toLocaleDateString() }}
          </span>
        </div>
      </div>
      <div v-if="isClient" class="flex gap-2">
        <BaseButton variant="secondary" @click="handleUploadExcel">
          <span class="i-jq-download h-4 w-4" />
          Загрузить файлом
        </BaseButton>
        <BaseButton variant="secondary" @click="handleCreateProduct">
          <span class="i-jq-plus-filled h-4 w-4" />
          Новый товар
        </BaseButton>
        <BaseButton variant="primary" @click="handleCreateInvoice">
          <span class="i-jq-plus-filled h-4 w-4" />
          Создать накладную
        </BaseButton>
      </div>
    </div>

    <!-- Search and Filters -->
    <SearchBar v-model="searchStore.searchQuery" />
    <FilterTabs v-model="productStore.selectedTab" :options="productStore.tabOptions" />

    <!-- Products List -->
    <div v-if="productStore.isLoadingProducts">
      <ProductCardSkeleton v-for="i in searchStore.size" :key="i" class="mb-4" />
    </div>
    <div v-else>
      <div v-if="!filteredProducts.length" class="py-8 text-center">
        Товары не найдены
      </div>
      <div v-else class="space-y-4">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />

        <!-- Pagination -->
        <div v-if="productStore.totalPages > 1" class="mt-6 flex justify-center">
          <AppPagination
            v-model:current-page="searchStore.page"
            :total-pages="productStore.totalPages"
          />
        </div>

        <!-- Total products count display -->
        <div class="mt-2 text-center text-sm text-gray-500">
          Всего товаров: {{ productStore.totalProducts }}
        </div>
      </div>
    </div>
  </div>
</template>
