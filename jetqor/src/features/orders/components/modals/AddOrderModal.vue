<script setup lang="ts">
import type { Product } from "~/features/products/types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { numberFormat } from "@/utils/number";
import { computed, ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { useOrdersQuery } from "~/features/orders/queries/orders";
import { useProductsStore } from "~/features/products/store/product";
import api from "~/plugins/api";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
}>();

// Define internal order statuses enum
const OrderStatuses = {
  PACKAGING: "packaging",
  ASSEMBLY: "assembly",
  PACKED: "packed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURN_REQUEST: "return_request",
  RETURN: "return",
};

// Use the updated product store instead of direct query
const productStore = useProductsStore();
const { refetch: refetchOrders } = useOrdersQuery();

interface OrderProduct {
  product: Product;
  quantity: number;
}

const searchQuery = ref("");
const selectedProducts = ref<OrderProduct[]>([]);

const formData = ref({
  kaspi_code: "",
  delivery_cost: "",
  status: OrderStatuses.PACKAGING, // Default status
  customer_phone: "",
  customer_name: "",
});

const errors = ref({
  products: "",
  kaspi_code: "",
  delivery_cost: "",
  status: "",
  customer_phone: "",
  customer_name: "",
});

// Available order statuses for dropdown (internal statuses) in correct business process order
const statusOptions = [
  { value: OrderStatuses.PACKAGING, label: "Упаковка" },
  { value: OrderStatuses.ASSEMBLY, label: "На сборке" },
  { value: OrderStatuses.PACKED, label: "Готов к отправке" },
  { value: OrderStatuses.COMPLETED, label: "Завершен" },
  { value: OrderStatuses.CANCELLED, label: "Отменен" },
  { value: OrderStatuses.RETURN_REQUEST, label: "Запрошен возврат" },
  { value: OrderStatuses.RETURN, label: "Возврат" },
];

const filteredProducts = computed(() => {
  // Get products from the store instead of direct query result
  if (!productStore.products.length)
    return [];

  if (!searchQuery.value)
    return productStore.products;

  const query = searchQuery.value.toLowerCase();
  return productStore.products.filter(product =>
    product.name.toLowerCase().includes(query)
    || product.article.toLowerCase().includes(query),
  );
});

function addProduct(product: Product) {
  const existing = selectedProducts.value.find(p => p.product.id === product.id);
  if (existing) {
    existing.quantity++;
  }
  else {
    selectedProducts.value.push({
      product,
      quantity: 1,
    });
  }
}

function removeProduct(productId: number) {
  selectedProducts.value = selectedProducts.value.filter(p => p.product.id !== productId);
}

function updateQuantity(productId: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const quantity = Math.max(1, Number.parseInt(target.value) || 1);

  const product = selectedProducts.value.find(p => p.product.id === productId);
  if (product) {
    product.quantity = quantity;
  }
}

const totalAmount = computed(() => {
  return selectedProducts.value.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
});

async function handleSubmit() {
  // Reset errors
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  // Validate all required fields
  let hasError = false;
  if (selectedProducts.value.length === 0) {
    errors.value.products = "Выберите хотя бы один товар";
    hasError = true;
  }
  if (!formData.value.kaspi_code) {
    errors.value.kaspi_code = "Введите код Kaspi";
    hasError = true;
  }
  if (!formData.value.delivery_cost || Number(formData.value.delivery_cost) < 0) {
    errors.value.delivery_cost = "Введите корректную стоимость доставки";
    hasError = true;
  }
  if (!formData.value.status) {
    errors.value.status = "Выберите статус заказа";
    hasError = true;
  }
  if (!formData.value.customer_phone) {
    errors.value.customer_phone = "Введите телефон клиента";
    hasError = true;
  }
  if (!formData.value.customer_name) {
    errors.value.customer_name = "Введите имя клиента";
    hasError = true;
  }

  if (hasError)
    return;

  try {
    // Calculate total price from selected products
    const total_price = totalAmount.value;

    // Format the request body according to the required schema
    const requestBody = {
      kaspi_code: formData.value.kaspi_code,
      total_price,
      delivery_cost: Number(formData.value.delivery_cost),
      status: formData.value.status,
      customer_phone: formData.value.customer_phone,
      customer_name: formData.value.customer_name,
      // Updated products format with create array and connect structure
      products: {
        create: selectedProducts.value.map(item => ({
          count: item.quantity,
          product: {
            connect: { id: item.product.id },
          },
        })),
      },
    };

    const response = await api("/order/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response) {
      // Обновляем список заказов после успешного создания
      await refetchOrders();
      emit("created");
      emit("close");
    }
  }
  catch (error) {
    console.error("Error creating order:", error);
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative max-w-4xl w-full rounded-lg bg-white p-6"
    overlay-class="bg-black/40"
  >
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-semibold">
        Создание заказа
      </h2>
      <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form class="max-h-70vh overflow-y-auto space-y-4" @submit.prevent="handleSubmit">
      <!-- Список доступных товаров -->
      <div>
        <label class="mb-2 block text-sm text-gray-700 font-medium">Доступные товары</label>
        <!-- Поиск -->
        <div class="mb-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по названию или артикулу..."
            class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          >
        </div>
        <div class="max-h-60 overflow-y-auto border rounded-md divide-y">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="product.photo_url"
                :src="product.photo_url"
                :alt="product.name"
                class="h-12 w-12 rounded object-cover"
              >
              <div>
                <div class="font-medium">
                  {{ product.name }}
                </div>
                <div class="text-sm text-gray-500">
                  Арт: {{ product.article }} | {{ numberFormat(product.price) }} KZT
                </div>
              </div>
            </div>
            <BaseButton variant="secondary" @click="addProduct(product)">
              Добавить
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Выбранные товары -->
      <div>
        <label class="mb-2 block text-sm text-gray-700 font-medium">Выбранные товары</label>
        <div class="space-y-2">
          <div
            v-for="item in selectedProducts"
            :key="item.product.id"
            class="flex items-center justify-between border rounded-md p-3"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="item.product.photo_url"
                :src="item.product.photo_url"
                :alt="item.product.name"
                class="h-12 w-12 rounded object-cover"
              >
              <div>
                <div class="font-medium">
                  {{ item.product.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ numberFormat(item.product.price) }} KZT × {{ item.quantity }} =
                  {{ numberFormat(item.product.price * item.quantity) }} KZT
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <input
                :value="item.quantity"
                type="number"
                min="1"
                class="w-20 border rounded px-2 py-1"
                @input="updateQuantity(item.product.id, $event)"
              >
              <button
                class="text-red-500 hover:text-red-600"
                @click="removeProduct(item.product.id)"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p v-if="errors.products" class="text-red-500 mt-1 text-sm">
          {{ errors.products }}
        </p>
      </div>

      <!-- Общая сумма -->
      <div class="flex justify-end text-lg font-medium">
        Итого: {{ numberFormat(totalAmount) }} KZT
      </div>

      <!-- Kaspi код -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Код Kaspi</label>
        <input
          v-model="formData.kaspi_code"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.kaspi_code }"
          placeholder="Введите код Kaspi (уникальный идентификатор)"
        >
        <p v-if="errors.kaspi_code" class="text-red-500 mt-1 text-sm">
          {{ errors.kaspi_code }}
        </p>
      </div>

      <!-- Стоимость доставки -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Стоимость доставки (тг)</label>
        <input
          v-model="formData.delivery_cost"
          type="number"
          min="0"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.delivery_cost }"
        >
        <p v-if="errors.delivery_cost" class="text-red-500 mt-1 text-sm">
          {{ errors.delivery_cost }}
        </p>
      </div>

      <!-- Статус заказа -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Статус заказа</label>
        <select
          v-model="formData.status"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.status }"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p v-if="errors.status" class="text-red-500 mt-1 text-sm">
          {{ errors.status }}
        </p>
      </div>

      <!-- Телефон клиента -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Телефон клиента</label>
        <input
          v-model="formData.customer_phone"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.customer_phone }"
          placeholder="+7 (XXX) XXX-XX-XX"
        >
        <p v-if="errors.customer_phone" class="text-red-500 mt-1 text-sm">
          {{ errors.customer_phone }}
        </p>
      </div>

      <!-- Имя клиента -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Имя клиента</label>
        <input
          v-model="formData.customer_name"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.customer_name }"
          placeholder="Введите имя клиента"
        >
        <p v-if="errors.customer_name" class="text-red-500 mt-1 text-sm">
          {{ errors.customer_name }}
        </p>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton variant="secondary" @click="emit('close')">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" type="submit">
          Создать заказ
        </BaseButton>
      </div>
    </form>
  </VueFinalModal>
</template>
