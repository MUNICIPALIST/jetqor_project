<script lang="ts" setup>
import useToasters from "~/composables/useToasters";
import OrderStatus from "~/features/orders/components/OrderStatus.vue";
import OrderStatusDetailed from "~/features/orders/components/OrderStatusDetailed.vue";
import { statusSteps } from "~/features/orders/data";
import { useOrderQuery } from "~/features/orders/queries/orders";
import { orderService } from "~/features/orders/services/orderService";

import { useProductsStore } from "~/features/products/store/product";

// Получаем данные заказа через API запрос
const { data: order, isLoading, error } = useOrderQuery();
const productStore = useProductsStore();
const { error: toastError } = useToasters();

// Определяем платформу заказа
const orderPlatform = computed(() => {
  if (!order.value)
    return null;

  if (order.value.kaspi_code)
    return "kaspi";
  if (order.value.wildberries_code)
    return "wildberries";
  if (order.value.ozon_code)
    return "ozon";

  return null;
});

// Получаем код заказа в зависимости от платформы
const orderCode = computed(() => {
  if (!order.value)
    return "";

  if (order.value.kaspi_code)
    return order.value.kaspi_code;
  if (order.value.wildberries_code)
    return order.value.wildberries_code;
  if (order.value.ozon_code)
    return order.value.ozon_code;

  return `Заказ №${order.value.id}`;
});

// Создаем статус-бейдж для типа доставки (экспресс или обычная)
const deliveryType = computed(() => {
  if (!order.value)
    return { label: "Стандартная", color: "gray" };

  return order.value.express
    ? { label: "Экспресс", color: "orange" }
    : { label: "Стандартная", color: "gray" };
});

// Форматируем продукты для отображения, используя информацию из хранилища продуктов
const formattedProducts = computed(() => {
  if (!order.value || !order.value.products || !productStore.products.length)
    return [];

  return order.value.products.map((orderProduct) => {
    orderProduct.product.count = orderProduct.count
    return orderProduct.product
  });
});

// Форматирование даты для отображения
function formatDate(dateString: string) {
  if (!dateString)
    return "Н/Д";

  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Функция для скачивания накладной
const isDownloading = ref(false);

async function forceDownload(url: string, filename?: string) {
  const res = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename || "invoice.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

async function downloadInvoice() {
  if (!order.value || isDownloading.value)
    return;

  try {
    isDownloading.value = true;

  // Без approve: получить ссылку по коду Kaspi и скачать
  const kaspiCode = order.value.kaspi_code || order.value.id;
  const url = await orderService.getConsignmentLink(kaspiCode);
  await forceDownload(url as string, `invoice-${kaspiCode}.pdf`);
  }
  catch (error) {
    console.error("Ошибка при скачивании накладной:", error);
    const msg = error instanceof Error ? error.message : "Попробуйте позже";
    toastError(`Не удалось скачать накладную: ${msg}`);
  }
  finally {
    isDownloading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p8 pl-30 pr-20px pt-32">
    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="my-8 flex flex-1 items-center justify-center">
      <div class="text-center">
        <div class="i-jq-clock mx-auto mb-4 h-8 w-8 animate-spin text-main" />
        <p class="text-lg text-gray-600">
          Загрузка данных заказа...
        </p>
      </div>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="my-8 flex flex-1 items-center justify-center">
      <div class="text-red-500 text-center">
        <div class="i-jq-paper-fail mx-auto mb-4 h-8 w-8" />
        <p class="text-lg">
          Ошибка при загрузке данных заказа
        </p>
        <p class="mt-2 text-sm">
          Пожалуйста, попробуйте обновить страницу
        </p>
      </div>
    </div>

    <!-- Детали заказа -->
    <div v-else-if="order" class="flex gap-4">
      <div class="flex flex-1 flex-col gap-3">
        <!-- Шапка заказа с основной информацией -->
        <div class="flex justify-between gap-4 rounded-3 bg-white p-6">
          <div class="flex flex-col gap-4">
            <!-- Заголовок со статусом -->
            <div class="flex items-center gap-3">
              <div class="text-h4 fw-700">
                № {{ orderCode }}
              </div>
              <OrderStatus :status="order.status" type="order" />

              <!-- Платформа заказа -->
              <div v-if="orderPlatform" class="flex items-center rounded-lg bg-grayscale-100 px-2 py-1">
                <img
                  :src="`/platforms/${orderPlatform}.svg`"
                  :alt="orderPlatform"
                  class="mr-1 h-5 w-5"
                >
                <span class="text-sm font-medium capitalize">{{ orderPlatform }}</span>
              </div>

              <!-- Тип доставки (экспресс или обычная) -->
              <div
                class="rounded-lg px-2 py-1 text-sm font-medium"
                :class="{
                  'bg-orange-100 text-orange-700': deliveryType.color === 'orange',
                  'bg-gray-100 text-gray-700': deliveryType.color === 'gray',
                }"
              >
                {{ deliveryType.label }}
              </div>
            </div>
            <div class="text-4.5 fw-500">
              {{ order.total_price }} ₸
            </div>
          </div>

          <div>
            <BaseButton
              icon="i-jq-download"
              :disabled="isDownloading"
              @click="downloadInvoice"
            >
              {{ isDownloading ? 'Скачивание...' : 'Скачать накладную' }}
            </BaseButton>
          </div>
        </div>

        <!-- Детальный статус заказа (только для активных заказов) -->
        <div
          v-if="order.status !== 'cancelled' && order.status !== 'return_request' && order.status !== 'return'"
          class="flex flex-col gap-8 rounded-3 bg-white px-4 py-5"
        >
          <div class="text-4.5 text-black fw-600">
            Статус заказа
          </div>

          <div class="max-w-58vw overflow-x-auto overflow-y-clip pb-6">
            <OrderStatusDetailed :status="order.status" :order-data="order" />
          </div>
        </div>

        <!-- Детальная информация о заказе -->
        <div class="rounded-xl bg-white p-6">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">
              Информация о заказе
            </h2>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Код заказа в зависимости от платформы -->
            <div v-if="order.kaspi_code">
              <div class="text-sm text-[#ABACAE]">
                Код Kaspi
              </div>
              <div class="font-medium">
                {{ order.kaspi_code }}
              </div>
            </div>

            <div v-if="order.wildberries_code">
              <div class="text-sm text-[#ABACAE]">
                Код Wildberries
              </div>
              <div class="font-medium">
                {{ order.wildberries_code }}
              </div>
            </div>

            <div v-if="order.ozon_code">
              <div class="text-sm text-[#ABACAE]">
                Код Ozon
              </div>
              <div class="font-medium">
                {{ order.ozon_code }}
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Общая стоимость
              </div>
              <div class="font-medium">
                {{ order.total_price }} ₸
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Создан в системе
              </div>
              <div class="font-medium">
                {{ formatDate(order.created_at) }}
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Создан на маркетплейсе
              </div>
              <div class="font-medium">
                {{ formatDate(order.marketplace_created_at) }}
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Стоимость доставки
              </div>
              <div class="font-medium">
                {{ order.delivery_cost }} ₸
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Тип доставки
              </div>
              <div class="font-medium">
                {{ deliveryType.label }}
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Имя клиента
              </div>
              <div class="font-medium">
                {{ order.customer_name }}
              </div>
            </div>

            <div>
              <div class="text-sm text-[#ABACAE]">
                Телефон клиента
              </div>
              <div class="font-medium">
                {{ order.customer_phone }}
              </div>
            </div>

            <!-- Статус Kaspi если он есть -->
            <div v-if="order.kaspi_status">
              <div class="text-sm text-[#ABACAE]">
                Статус Kaspi
              </div>
              <div class="font-medium">
                {{ order.kaspi_status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Список товаров в заказе -->
        <div class="rounded-xl bg-white p-6">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">
              Товары в заказе
            </h2>
            <div class="text-sm text-gray-500">
              Всего товаров: {{ formattedProducts.length }}
            </div>
          </div>

          <div v-if="formattedProducts.length === 0" class="py-4 text-center text-gray-500">
            Нет товаров в заказе
          </div>

          <div v-else class="mt-4 divide-y divide-gray-100">
            <div v-for="product in formattedProducts" :key="product.id" class="py-4 first:pt-0 last:pb-0">
              <div class="flex items-center gap-4">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="h-16 w-16 rounded-lg object-cover"
                >
                <div class="flex-1">
                  <div class="font-medium">
                    {{ product.name }}
                  </div>
                  <div class="mt-1 text-sm text-gray-500">
                    Артикул: {{ product.article }}
                  </div>
                </div>
                <div>
                  <div class="text-right font-medium">
                    {{ product.price }}
                  </div>
                  <div class="mt-1 text-right text-sm text-gray-500">
                    Кол-во: {{ product.count }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая панель -->
      <div class="w-1/3 flex flex-col gap-4">
        <!-- Информация о статусе заказа -->
        <div class="flex flex-col gap-3 border border-#EDF2F7 rounded-3 bg-white p-6">
          <div class="text-h5 fw-700">
            Статус заказа
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-green-500': order.status === 'completed',
                  'bg-red-500': order.status === 'cancelled',
                  'bg-yellow-500': order.status === 'assembly',
                  'bg-orange-500': order.status === 'packaging',
                  'bg-blue-500': order.status === 'packed',
                  'bg-brown-500': order.status === 'return_request',
                  'bg-gray-500': order.status === 'return',
                }"
              />
              <span class="capitalize">{{ statusSteps.find(s => s.key === order?.status)?.label }}</span>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Обновлен: {{ formatDate(order.updated_at) }}
            </p>
          </div>
        </div>

        <!-- Информация о клиенте -->
        <div class="flex flex-col gap-3 border border-#EDF2F7 rounded-3 bg-white p-6">
          <div class="text-h5 fw-700">
            Клиент
          </div>
          <AppButton
            :avatar="{
              fallback: order.customer_name ? order.customer_name[0].toUpperCase() : 'К',
            }"
            size="lg"
            subtitle="Пользователь"
            show-arrow
          >
            {{ order.customer_name }}
          </AppButton>
          <div class="mt-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="i-jq-message text-gray-500" />
              <a :href="`tel:${order.customer_phone}`" class="text-main hover:underline">
                {{ order.customer_phone }}
              </a>
            </div>
          </div>
        </div>

        <!-- Миниатюры товаров в заказе -->
        <div class="flex flex-col gap-3 border border-#EDF2F7 rounded-3 bg-white p-6">
          <div class="flex items-center justify-between">
            <div class="text-h5 fw-700">
              Товары в заказе
            </div>
            <div class="text-sm text-gray-500">
              Всего: {{ formattedProducts.length }}
            </div>
          </div>

          <div v-if="formattedProducts.length === 0" class="py-4 text-center text-gray-500">
            Нет товаров в заказе
          </div>

          <!-- Используем новый компонент вместо ProductCardSmall -->
          <div class="divide-y divide-gray-100">
            <div v-for="product in formattedProducts" :key="product.id" class="py-4 first:pt-0 last:pb-0">
              <div class="flex items-center gap-4">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="h-12 w-12 rounded-lg object-cover"
                >
                <div class="flex-1">
                  <div class="font-medium">
                    {{ product.name }}
                  </div>
                  <div class="mt-1 text-sm text-gray-500">
                    Артикул: {{ product.article }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium">
                    {{ product.price }}
                  </div>
                  <div class="mt-1 text-sm text-gray-500">
                    Кол-во: {{ product.count }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Если заказ не найден -->
    <div v-else class="my-8 flex flex-1 items-center justify-center">
      <div class="text-center">
        <div class="i-jq-paper-fail mx-auto mb-4 h-8 w-8 text-gray-400" />
        <p class="text-lg text-gray-600">
          Заказ не найден
        </p>
        <router-link to="/orders" class="mt-4 inline-block text-main hover:underline">
          Вернуться к списку заказов
        </router-link>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: small
</route>
