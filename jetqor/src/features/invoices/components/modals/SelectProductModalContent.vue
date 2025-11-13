<script setup lang="ts">
import type { InvoiceProductDetails } from "../../types";
import { computed, ref } from "vue";
import { useProductDistributionStore } from "../../store/productDistribution";

const props = defineProps<{
  products: InvoiceProductDetails[];
}>();

defineEmits<{
  (e: "close"): void;
  (e: "save", quantities: Record<number, number>): void;
}>();

const productDistributionStore = useProductDistributionStore();

// Поисковый запрос
const searchQuery = ref("");

// Отфильтрованные товары
const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return props.products;
  }

  const query = searchQuery.value.toLowerCase();
  return props.products.filter(
    product =>
      product.name.toLowerCase().includes(query)
      || product.article.toLowerCase().includes(query),
  );
});

// Управление количеством товаров
const quantities = ref<Record<number, number>>({});

// Получить количество товара для ячейки - using product.id instead of productId
function getQuantity(id: number): number {
  return quantities.value[id] || 0;
}

// Получить доступное количество товара (всего - уже распределенные по другим ячейкам)
function getAvailableQuantity(product: InvoiceProductDetails): number {
  const totalDistributed = productDistributionStore.getTotalDistributedCount(product.id);
  return Math.max(0, product.invoiceCount - totalDistributed);
}

// Обновить количество товара
function updateQuantity(id: number, value: number) {
  const product = props.products.find(p => p.id === id);
  if (!product)
    return;

  const availableQuantity = getAvailableQuantity(product);
  const newQuantity = Math.max(0, Math.min(availableQuantity, value));

  if (newQuantity === 0) {
    delete quantities.value[id];
  }
  else {
    quantities.value[id] = newQuantity;
  }
}

// Обработчик ввода с принудительным ограничением
function handleInput(product: InvoiceProductDetails, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = Number.parseInt(input.value) || 0;
  const availableQuantity = getAvailableQuantity(product);

  // Принудительно ограничиваем значение
  const limitedValue = Math.max(0, Math.min(availableQuantity, value));

  // Если пользователь ввел значение больше доступного, исправляем его
  if (value > availableQuantity) {
    input.value = limitedValue.toString();
  }

  updateQuantity(product.id, limitedValue);
}

defineExpose({
  quantities,
});
</script>

<template>
  <div class="mt-6 space-y-5">
    <!-- Поиск товаров -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск товаров"
        class="w-full border border-grayscale-200 rounded-lg py-3 pl-10 pr-3 text-sm placeholder:text-grey"
      >
      <div class="absolute left-3 top-1/2 -translate-y-1/2">
        <div class="i-jq-search h-4 w-4 text-grey" />
      </div>
    </div>

    <!-- Список товаров -->
    <div v-if="filteredProducts.length > 0" class="max-h-[300px] overflow-auto space-y-3">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="flex items-center justify-between border border-grayscale-200 rounded-lg p-3"
      >
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded bg-grayscale-100" />
          <div>
            <div class="text-sm font-semibold">
              {{ product.name }}
            </div>
            <div class="text-xs text-grey">
              {{ product.article }}
            </div>
          </div>
        </div>

        <!-- Количество товаров -->
        <div class="flex items-center gap-3">
          <div class="text-sm font-medium">
            Доступно: {{ getAvailableQuantity(product) }} шт.
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Кол-во:</span>
            <input
              :value="getQuantity(product.id)"
              type="number"
              min="0"
              :max="getAvailableQuantity(product)"
              class="h-8 w-16 border border-gray-200 rounded-lg text-center outline-none focus:border-main"
              @input="handleInput(product, $event)"
              @blur="handleInput(product, $event)"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение, если товары не найдены -->
    <div v-else class="flex flex-col items-center justify-center py-10">
      <div class="text-lg font-semibold">
        Товары не найдены
      </div>
      <div class="text-sm text-grey">
        Попробуйте изменить поисковый запрос
      </div>
    </div>
  </div>
</template>
