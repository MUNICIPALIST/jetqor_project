<script setup lang="ts">
import type { ClientSelectedProduct } from "../../types/client";
import type { Product } from "@/features/products/types";
import { useIntersectionObserver } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { VueFinalModal } from "vue-final-modal";
import BaseButton from "@/components/ui/BaseButton/index.vue";

import { numberFormat } from "@/utils/number";
import useToasters from "~/composables/useToasters";
import api from "~/plugins/api";
import { useInvoicesQuery } from "../../queries/invoices";
import { clientInvoiceService } from "../../services/clientInvoiceService";
import { useClientInvoiceStore } from "../../stores/clientInvoice";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

// Import query and its refetch function
const { refetch: refetchInvoices } = useInvoicesQuery();
const { success, error } = useToasters();

const isLoading = ref(false);
const searchQuery = ref("");
const selectedStorage = ref<number | null>(null);
const selectedType = ref<"incoming" | "consumable" | "internal" | "return">("incoming"); // Default type
const storages = ref<{ id: number; name: string }[]>([]);
const isLoadingStorages = ref(true);

// Invoice type options
const invoiceTypes = [
  { value: "incoming", label: "Приходная" },
  { value: "consumable", label: "Расходная" },
  { value: "internal", label: "Внутренняя" },
  { value: "return", label: "Возвратная" },
];

const clientInvoiceStore = useClientInvoiceStore();

// Локальное состояние для пагинации в модальном окне
const currentPage = ref(1);
const pageSize = ref(10);
const allProducts = ref<Product[]>([]);
const isLoadingProducts = ref(false);
const isLoadingMore = ref(false);
const loadTrigger = ref<HTMLElement | null>(null);
const paginationInfo = ref<any>(null);

// Функция для загрузки продуктов с пагинацией
async function loadProducts(page: number, reset = false) {
  try {
    if (reset) {
      isLoadingProducts.value = true;
      allProducts.value = [];
    }
    else {
      isLoadingMore.value = true;
    }

    const response = await api(`/product/my?page=${page}&size=${pageSize.value}${searchQuery.value ? `&searchQuery=${searchQuery.value}` : ""}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Сохраняем информацию о пагинации
    paginationInfo.value = response.pagination;

    if (reset) {
      allProducts.value = response.products || [];
    }
    else {
      const existingIds = new Set(allProducts.value.map((p: any) => p.id));
      const newUniqueProducts = (response.products || []).filter((p: any) => !existingIds.has(p.id));
      allProducts.value.push(...newUniqueProducts);
    }

    return response;
  }
  catch (error) {
    console.error("Failed to load products:", error);
    return null;
  }
  finally {
    isLoadingProducts.value = false;
    isLoadingMore.value = false;
  }
}

// Fetch warehouses from API
onMounted(async () => {
  try {
    isLoadingStorages.value = true;
    const response = await api<any[]>("/storage/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    storages.value = response.map(storage => ({
      id: storage.id,
      name: storage.name,
    }));
  }
  catch (error) {
    console.error("Failed to fetch storages:", error);
    storages.value = [];
  }
  finally {
    isLoadingStorages.value = false;
  }
});

// Загрузка продуктов при монтировании
onMounted(async () => {
  await loadProducts(1, true);
});

// Сброс при изменении поиска
watch(searchQuery, async () => {
  currentPage.value = 1;
  await loadProducts(1, true);
});

// Фильтрация продуктов
const filteredProducts = computed<Product[]>(() => {
  if (!searchQuery.value) {
    return allProducts.value;
  }

  const query = searchQuery.value.toLowerCase();
  return allProducts.value.filter((product: Product) =>
    product.name.toLowerCase().includes(query)
    || product.article.toLowerCase().includes(query),
  );
});

// Пагинация
const hasMorePages = computed(() => {
  if (!paginationInfo.value)
    return false;
  return paginationInfo.value.page < paginationInfo.value.totalPages;
});

// Загрузка следующей страницы
async function loadNextPage() {
  if (!hasMorePages.value || isLoadingProducts.value || isLoadingMore.value)
    return;

  currentPage.value += 1;
  await loadProducts(currentPage.value, false);
}

// Intersection Observer для автоматической подгрузки
useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMorePages.value && !isLoadingProducts.value && !isLoadingMore.value) {
      loadNextPage();
    }
  },
  {
    threshold: 0.1,
    rootMargin: "200px",
  },
);

function formatPrice(price: number): string {
  return `${numberFormat(price)} KZT`;
}

function handleAddProduct(product: any) {
  const selectedProduct: ClientSelectedProduct = {
    productId: product.id,
    name: product.name,
    article: product.article,
    imageUrl: product.photo_url,
    price: product.price,
    count: 1,
  };

  clientInvoiceStore.addProduct(selectedProduct);
}

function handleRemoveProduct(productId: number) {
  clientInvoiceStore.removeProduct(productId);
}

function updateProductCount(productId: number, count: number) {
  if (count > 0) {
    clientInvoiceStore.updateProductCount(productId, count);
  }
}

async function handleConfirm() {
  if (!selectedStorage.value || !clientInvoiceStore.selectedProducts.length)
    return;

  try {
    isLoading.value = true;

    await clientInvoiceService.create({
      storageId: selectedStorage.value,
      type: selectedType.value,
      products: clientInvoiceStore.selectedProducts.map(product => ({
        productId: product.productId,
        count: product.count,
      })),
    });

    // Refresh the invoice list
    await refetchInvoices();

    // Show success message
    success("Накладная успешно создана");

    emit("success");
    clientInvoiceStore.reset();
  }
  catch (err) {
    console.error("Error creating invoice:", err);
    error("Ошибка при создании накладной");
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="flex flex-col max-w-4xl w-full m-4 p-6 bg-white rounded-lg"
    overlay-class="bg-black/40 "
    :click-to-close="false"
  >
    <header class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        Создание накладной
      </h2>
      <button class="p-1" @click="emit('close')">
        <span class="i-jq-close h-4 w-4" />
      </button>
    </header>

    <div class="mb-6">
      <label class="mb-2 block text-sm font-medium">
        Склад
      </label>
      <select
        v-model="selectedStorage"
        class="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
        :disabled="isLoadingStorages"
      >
        <option :value="null" disabled>
          {{ isLoadingStorages ? 'Загрузка складов...' : 'Выберите склад' }}
        </option>
        <option
          v-for="storage in storages"
          :key="storage.id"
          :value="storage.id"
        >
          {{ storage.name }}
        </option>
      </select>
    </div>

    <div class="mb-6">
      <label class="mb-2 block text-sm font-medium">
        Тип накладной
      </label>
      <select
        v-model="selectedType"
        class="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
      >
        <option
          v-for="type in invoiceTypes"
          :key="type.value"
          :value="type.value"
        >
          {{ type.label }}
        </option>
      </select>
    </div>

    <div class="mb-6">
      <div class="relative">
        <span class="absolute inset-y-0 left-3 flex items-center">
          <span class="i-jq-search h-5 w-5 text-gray-400" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию или артикулу"
          class="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 outline-none focus:border-main"
        >
      </div>
    </div>

    <!-- Products List -->
    <div class="mb-6 max-h-[200px] flex-1 overflow-y-auto">
      <div v-if="isLoadingProducts" class="py-8 text-center">
        Загрузка...
      </div>
      <div v-else-if="!filteredProducts.length" class="py-8 text-center">
        Товары не найдены
      </div>
      <div v-else class="grid grid-cols-1 gap-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="flex items-center justify-between border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-lg bg-gray-100">
              <img
                v-if="product.photo_url"
                :src="product.photo_url"
                :alt="product.name"
                class="h-full w-full rounded-lg object-cover"
              >
            </div>
            <div>
              <h3 class="mb-1 font-medium">
                {{ product.name }}
              </h3>
              <p class="text-sm text-gray-500">
                Артикул: {{ product.article }}
              </p>
              <p class="text-sm text-main font-medium">
                {{ formatPrice(product.price) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div
              v-if="clientInvoiceStore.selectedProducts.find(p => p.productId === product.id)"
              class="flex items-center gap-2"
            >
              <div class="flex items-center gap-1">
                <span class="text-sm text-gray-600">Кол-во:</span>
                <input
                  :value="clientInvoiceStore.selectedProducts.find(p => p.productId === product.id)?.count || 1"
                  type="number"
                  min="1"
                  class="h-8 w-16 border border-gray-200 rounded-lg text-center outline-none focus:border-main"
                  @input="updateProductCount(product.id, parseInt(($event.target as HTMLInputElement).value) || 1)"
                  @blur="updateProductCount(product.id, parseInt(($event.target as HTMLInputElement).value) || 1)"
                >
              </div>
              <button
                class="text-red-500 hover:text-red-700"
                @click="handleRemoveProduct(product.id)"
              >
                Удалить
              </button>
            </div>
            <BaseButton
              v-else
              variant="primary"
              @click="handleAddProduct(product)"
            >
              Добавить
            </BaseButton>
          </div>
        </div>

        <!-- Триггер для автоматической подгрузки -->
        <div
          v-if="hasMorePages"
          ref="loadTrigger"
          class="flex justify-center py-4"
        >
          <BaseButton
            variant="secondary"
            :loading="isLoadingMore"
            :disabled="isLoadingProducts || isLoadingMore"
            @click="loadNextPage"
          >
            {{ isLoadingMore ? 'Загружаем...' : 'Загрузить еще товары' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="border-t border-gray-200 pt-4">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">
            Выбрано товаров: {{ clientInvoiceStore.totalProducts }}
          </p>
          <p class="text-sm text-gray-500">
            Общее количество: {{ clientInvoiceStore.totalCount }} шт.
          </p>
        </div>
        <p class="text-lg font-bold">
          Итого: {{ formatPrice(clientInvoiceStore.totalPrice) }}
        </p>
      </div>

      <div class="flex justify-end gap-4">
        <BaseButton variant="secondary" @click="emit('close')">
          Отмена
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="isLoading"
          :disabled="!selectedStorage || !clientInvoiceStore.selectedProducts.length"
          @click="handleConfirm"
        >
          Создать накладную
        </BaseButton>
      </div>
    </div>
  </VueFinalModal>
</template>
