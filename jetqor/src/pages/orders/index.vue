<script lang="ts" setup>
import type { ComponentOrder } from "@/features/orders/adapters/orderAdapter";

import { useIntersectionObserver } from "@vueuse/core";
import JSZip from "jszip";
import { computed, ref, watch } from "vue";

import BaseButton from "@/components/ui/BaseButton/index.vue";
import { adaptOrders } from "@/features/orders/adapters/orderAdapter";
import { useAddOrderModal } from "@/features/orders/composables/useAddOrderModal";
import { useOrdersQuery } from "@/features/orders/queries/orders";
import { orderService } from "@/features/orders/services/orderService";
import FilterTabs from "~/components/FilterTabs.vue";
import SearchBar from "~/components/SearchBar.vue";
import useToasters from "~/composables/useToasters";
import OrderCard from "~/features/orders/components/OrderCard.vue";
import SummaryCard from "~/features/orders/components/SummaryCard.vue";
import { useSearchOrderStore } from "~/features/orders/store/search";

const searchOrderStore = useSearchOrderStore();

const tabOptions = [
  { label: "Все", value: "all" },
  { label: "Упаковка", value: "packaging" },
  { label: "На сборке", value: "assembly" },
  { label: "Готов к отправке", value: "packed" },
  { label: "Завершен", value: "completed" },
  { label: "Отменен", value: "cancelled" },
  { label: "Запрошен возврат", value: "return_request" },
  { label: "Возврат", value: "return" },
];

const expressFilterOptions = [
  { label: "Все", value: "all" },
  { label: "Экспресс", value: "express" },
  { label: "Обычные", value: "regular" },
];

const { data: orders, isLoading, refetch: refetchOrders } = useOrdersQuery();
const { openModal } = useAddOrderModal();
const { error: toastError, success: toastSuccess } = useToasters();

// Состояние для накопления заказов
const allOrders = ref<ComponentOrder[]>([]);
const isLoadingMore = ref(false);

// Computed свойства для работы с фильтрами из store
const selectedTab = computed({
  get: () => searchOrderStore.status,
  set: (value) => {
    if (!isLoading.value) {
      console.warn("Смена статуса на:", value);
      searchOrderStore.setStatus(value);
    }
    else {
      console.warn("Не можем сменить статус - идет загрузка");
    }
  },
});

const expressFilter = computed({
  get: () => searchOrderStore.expressFilter,
  set: (value) => {
    if (!isLoading.value) {
      console.warn("Смена экспресс фильтра на:", value);
      searchOrderStore.setExpressFilter(value);
    }
    else {
      console.warn("Не можем сменить экспресс фильтр - идет загрузка");
    }
  },
});

// Computed для пагинации
const hasMorePages = computed(() => {
  if (!orders.value?.pagination)
    return false;
  return orders.value.pagination.page < orders.value.pagination.totalPages;
});

// Функция загрузки следующей страницы
async function loadNextPage() {
  if (!hasMorePages.value || isLoading.value || isLoadingMore.value)
    return;

  try {
    isLoadingMore.value = true;
    searchOrderStore.nextPage();
    await refetchOrders();
  }
  finally {
    isLoadingMore.value = false;
  }
}

// Intersection Observer для автоматической подгрузки
const loadTrigger = ref<HTMLElement | null>(null);

// Используем VueUse intersection observer
useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMorePages.value && !isLoading.value && !isLoadingMore.value) {
      loadNextPage();
    }
  },
  {
    threshold: 0.1,
    rootMargin: "200px",
  },
);

// Сброс накопленных заказов и перезагрузка при смене фильтров
watch([() => searchOrderStore.status, () => searchOrderStore.expressFilter], async () => {
  // Очищаем накопленные заказы
  allOrders.value = [];

  // Принудительно перезагружаем данные
  await refetchOrders();
});

// Состояние для массового выбора
const selectionMode = ref(false);
const selectedOrderIds = ref<Set<number>>(new Set());
const isBulkDownloading = ref(false);
const isBulkAssembling = ref(false);
const isBulkPacking = ref(false);

const filteredOrders = computed<ComponentOrder[]>(() => {
  return allOrders.value;
});

// Watcher для обновления накопленных заказов
watch(orders, (newOrders) => {
  if (!newOrders?.orders) {
    console.warn("Новые данные заказов пустые:", newOrders);
    return;
  }

  const adaptedOrders = adaptOrders(newOrders.orders);
  console.warn("Обновление заказов, страница:", searchOrderStore.page, "Новых заказов:", adaptedOrders.length);

  if (searchOrderStore.page === 1) {
    // Первая страница - заменяем все заказы
    allOrders.value = adaptedOrders;
    console.warn("Заменили все заказы, теперь всего:", allOrders.value.length);
  }
  else {
    // Последующие страницы - добавляем к существующим
    const existingIds = new Set(allOrders.value.map(o => o.id));
    const newUniqueOrders = adaptedOrders.filter(o => !existingIds.has(o.id));
    allOrders.value.push(...newUniqueOrders);
    console.warn("Добавили", newUniqueOrders.length, "новых заказов, теперь всего:", allOrders.value.length);
  }
}, { immediate: true });

// Вычисляемые свойства для массового выбора
const allOrdersSelected = computed(() => {
  return filteredOrders.value.length > 0
    && filteredOrders.value.every(order => selectedOrderIds.value.has(order.id));
});

const someOrdersSelected = computed(() => {
  return selectedOrderIds.value.size > 0 && !allOrdersSelected.value;
});

const selectedOrdersCount = computed(() => selectedOrderIds.value.size);

function handleAddOrder() {
  openModal();
}

// Функции для массового выбора
function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) {
    selectedOrderIds.value.clear();
  }
}

function toggleAllOrders() {
  if (allOrdersSelected.value) {
    selectedOrderIds.value.clear();
  }
  else {
    filteredOrders.value.forEach((order) => {
      selectedOrderIds.value.add(order.id);
    });
  }
}

function toggleOrderSelection(orderId: number, selected: boolean) {
  if (selected) {
    selectedOrderIds.value.add(orderId);
  }
  else {
    selectedOrderIds.value.delete(orderId);
  }
}

// helper to force download a URL
async function forceDownload(url: string, filename?: string) {
  try {
    console.warn(`Начинаем скачивание файла: ${filename} из URL: ${url}`);

    const res = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      headers: {
        Accept: "application/pdf,*/*",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    console.warn(`Получен ответ для ${filename}, размер: ${res.headers.get("content-length")} байт`);

    const blob = await res.blob();
    console.warn(`Создан blob для ${filename}, размер: ${blob.size} байт, тип: ${blob.type}`);

    if (blob.size === 0) {
      throw new Error(`Получен пустой файл для ${filename}`);
    }

    // Создаем временную ссылку
    const objectUrl = URL.createObjectURL(blob);

    // Пробуем разные методы скачивания
    try {
      // Метод 1: Создание невидимого элемента a с принудительным кликом
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename || "invoice.pdf";
      a.style.display = "none";
      a.style.position = "absolute";
      a.style.left = "-9999px";

      // Добавляем в DOM
      document.body.appendChild(a);

      // Принудительный клик с событием
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: false,
      });

      a.dispatchEvent(clickEvent);

      console.warn(`Файл ${filename} успешно запущен на скачивание (метод 1)`);

      // Очищаем ресурсы через некоторое время
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(objectUrl);
      }, 2000);
    }
    catch (downloadError) {
      console.warn(`Метод 1 не сработал для ${filename}, показываем ссылку для ручного скачивания:`, downloadError);

      // Показываем пользователю ссылку для ручного скачивания
      const downloadLink = document.createElement("div");
      downloadLink.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: white; border: 2px solid #007bff; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000; max-width: 300px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Скачать файл: ${filename}</p>
          <a href="${objectUrl}" download="${filename}" style="display: inline-block; background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px;">Скачать</a>
          <button onclick="this.parentElement.parentElement.remove(); URL.revokeObjectURL('${objectUrl}')" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Закрыть</button>
        </div>
      `;
      document.body.appendChild(downloadLink);

      console.warn(`Показана ссылка для ручного скачивания ${filename}`);
    }
  }
  catch (error) {
    console.error(`Ошибка при скачивании файла ${filename}:`, error);
    throw error;
  }
}

// Функция для скачивания накладных в ZIP архиве
async function downloadInvoicesAsZip(results: { kaspiCode: string; url?: string; error?: unknown }[]) {
  try {
    console.warn("Создаем ZIP архив с накладными...");
    const zip = new JSZip();
    let addedFilesCount = 0;

    // Добавляем все PDF файлы в ZIP
    for (const r of results) {
      if (r.url) {
        try {
          console.warn(`Загружаем файл для заказа ${r.kaspiCode} в ZIP...`);

          const response = await fetch(r.url, {
            mode: "cors",
            credentials: "omit",
            headers: { Accept: "application/pdf,*/*" },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const blob = await response.blob();

          if (blob.size === 0) {
            throw new Error(`Получен пустой файл для ${r.kaspiCode}`);
          }

          // Добавляем файл в ZIP архив
          zip.file(`invoice-${r.kaspiCode}.pdf`, blob);
          addedFilesCount++;

          console.warn(`Файл invoice-${r.kaspiCode}.pdf добавлен в ZIP (${blob.size} байт)`);
        }
        catch (error) {
          console.error(`Ошибка при добавлении файла ${r.kaspiCode} в ZIP:`, error);
        }
      }
    }

    if (addedFilesCount === 0) {
      throw new Error("Не удалось добавить ни одного файла в ZIP архив");
    }

    console.warn(`Генерируем ZIP архив с ${addedFilesCount} файлами...`);

    // Генерируем ZIP архив
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Создаем имя файла с текущей датой
    const currentDate = new Date().toISOString().split("T")[0];
    const zipFilename = `invoices-${currentDate}-${addedFilesCount}files.zip`;

    // Скачиваем ZIP файл
    await forceDownload(URL.createObjectURL(zipBlob), zipFilename);

    console.warn(`ZIP архив ${zipFilename} создан и скачан успешно`);
    return addedFilesCount;
  }
  catch (error) {
    console.error("Ошибка при создании ZIP архива:", error);
    throw error;
  }
}

// Функция массового скачивания накладных
async function bulkDownloadInvoices() {
  if (selectedOrderIds.value.size === 0 || isBulkDownloading.value)
    return;

  try {
    isBulkDownloading.value = true;

    const orderIdsArray = Array.from(selectedOrderIds.value);
    // Map selected internal IDs to their Kaspi codes
    const kaspiCodes = orderIdsArray.map(id => orders.value?.orders.find(o => o.id === id)?.kaspi_code || id);
    const results = await orderService.bulkGetConsignmentLinks(kaspiCodes);

    // Скачиваем все накладные одним ZIP архивом
    const downloadedFilesCount = await downloadInvoicesAsZip(results);

    if (downloadedFilesCount === 0) {
      toastError("Не удалось скачать ни одной накладной. Проверьте API ключ в настройках.");
    }
    else {
      console.warn(`Скачан ZIP архив с ${downloadedFilesCount} накладными`);
    }

    selectedOrderIds.value.clear();
    selectionMode.value = false;
  }
  catch (error) {
    console.error("Ошибка при массовом скачивании накладных:", error);
  }
  finally {
    isBulkDownloading.value = false;
  }
}

// Функция массового выполнения сборки (для статуса packaging)
async function bulkAssembleOrders() {
  if (selectedOrderIds.value.size === 0 || isBulkAssembling.value)
    return;

  try {
    isBulkAssembling.value = true;

    const orderIdsArray = Array.from(selectedOrderIds.value);
    let successCount = 0;
    let errorCount = 0;

    // Выполняем сборку для каждого заказа
    for (const orderId of orderIdsArray) {
      try {
        const order = orders.value?.orders.find(o => o.id === orderId);
        if (!order || !order.products) {
          console.error(`Заказ ${orderId} не найден или не содержит товаров`);
          errorCount++;
          continue;
        }

        let approvalProducts = [];

        // Проверяем, есть ли storage_id у заказа
        if (order.storage_id) {
          try {
            // Получаем все склады и находим склад с соответствующим storage_id
            const { warehouseService } = await import("~/features/warehouses/services/warehouseService");
            const warehouses = await warehouseService.getWarehouses();

            const targetWarehouse = warehouses.find(warehouse => warehouse.id === order.storage_id);

            if (targetWarehouse && targetWarehouse.cells && targetWarehouse.cells.length > 0) {
              // Используем первую доступную ячейку из целевого склада
              const firstCell = targetWarehouse.cells[0];
              console.warn(`Заказ ${orderId}: используем склад "${targetWarehouse.name}" (ID: ${targetWarehouse.id}), ячейка "${firstCell.name}" (ID: ${firstCell.id})`);

              approvalProducts = order.products.map(product => ({
                product_id: product.productId,
                cell_id: firstCell.id,
                count: product.count,
                cell_code: firstCell.article || `Cell-${firstCell.id}`,
                cell_name: firstCell.name || `Ячейка ${firstCell.id}`,
              }));
            }
            else {
              console.warn(`Склад с storage_id ${order.storage_id} не найден или не содержит ячеек для заказа ${orderId}. Используем fallback.`);
              // Используем fallback с фиктивными данными
              approvalProducts = order.products.map(product => ({
                product_id: product.productId,
                cell_id: 1,
                count: product.count,
                cell_code: "FALLBACK-1-1",
                cell_name: "Fallback ячейка",
              }));
            }
          }
          catch (storageError) {
            console.error(`Ошибка при получении данных склада для заказа ${orderId}:`, storageError);
            // Используем fallback с фиктивными данными
            approvalProducts = order.products.map(product => ({
              product_id: product.productId,
              cell_id: 1,
              count: product.count,
              cell_code: "ERROR-1-1",
              cell_name: "Error fallback ячейка",
            }));
          }
        }
        else {
          console.warn(`Заказ ${orderId} не содержит storage_id. Используем fallback.`);
          // Используем fallback с фиктивными данными
          approvalProducts = order.products.map(product => ({
            product_id: product.productId,
            cell_id: 1,
            count: product.count,
            cell_code: "NO-STORAGE-1-1",
            cell_name: "No storage fallback ячейка",
          }));
        }

        await orderService.approveOrderAssembly(orderId, approvalProducts);
        successCount++;
        console.warn(`Заказ ${orderId} успешно собран`);

        // Показываем тоастер для каждого успешно собранного заказа
        const successOrder = orders.value?.orders.find(o => o.id === orderId);
        const successOrderNumber = successOrder?.kaspi_code || orderId;
        toastSuccess(`Заказ ${successOrderNumber} успешно собран!`);
      }
      catch (error) {
        console.error(`Ошибка при сборке заказа ${orderId}:`, error);
        errorCount++;

        // Показываем тоастер об ошибке
        const errorOrder = orders.value?.orders.find(o => o.id === orderId);
        const errorOrderNumber = errorOrder?.kaspi_code || orderId;
        const errorMsg = error instanceof Error ? error.message : "Неизвестная ошибка";
        toastError(`Ошибка при сборке заказа ${errorOrderNumber}: ${errorMsg}`);
      }
    }

    // Показываем результат операции
    if (successCount > 0) {
      console.warn(`Успешно собрано заказов: ${successCount}`);

      // Ожидаем обновления статуса в Kaspi перед скачиванием накладных
      toastSuccess(`⏳ Заказы переданы в Kaspi. Ждем обновления статуса для скачивания накладных...`);
      console.warn("Ждем 5 секунд для обновления статуса заказов в Kaspi...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Скачиваем накладные для успешно собранных заказов
      try {
        console.warn("Начинаем скачивание накладных для собранных заказов...");
        const successfulOrderIds = orderIdsArray.slice(0, successCount); // Берем только успешно обработанные заказы
        const kaspiCodes = successfulOrderIds.map(id => orders.value?.orders.find(o => o.id === id)?.kaspi_code || id);
        const results = await orderService.bulkGetConsignmentLinks(kaspiCodes);

        // Скачиваем все накладные одним ZIP архивом
        const downloadedFilesCount = await downloadInvoicesAsZip(results);

        if (downloadedFilesCount > 0) {
          console.warn(`Скачан ZIP архив с ${downloadedFilesCount} накладными`);
          // Показываем итоговый тоастер об успешном завершении
          toastSuccess(`✅ Успешно собрано ${successCount} заказов и скачано ${downloadedFilesCount} накладных!`);
        }
        else {
          toastError("Не удалось скачать ни одной накладной. Проверьте API ключ в настройках.");
        }
      }
      catch (downloadError) {
        console.error("Ошибка при скачивании накладных:", downloadError);
        toastError("Произошла ошибка при скачивании накладных");
      }
    }
    if (errorCount > 0) {
      console.error(`Ошибок при сборке: ${errorCount}`);
      toastError(`Не удалось собрать ${errorCount} из ${orderIdsArray.length} заказов`);
    }

    // Очищаем выбор и обновляем данные
    selectedOrderIds.value.clear();
    selectionMode.value = false;

    // Очищаем выбор и обновляем данные
    selectedOrderIds.value.clear();
    selectionMode.value = false;

    // Обновляем данные заказов
    console.warn("Обновляем данные заказов...");
    await refetchOrders();
  }
  catch (error) {
    console.error("Ошибка при массовой сборке заказов:", error);
    toastError("Произошла ошибка при массовой сборке заказов");
  }
  finally {
    isBulkAssembling.value = false;
  }
}

// Функция массового упаковывания (для статуса assembly)
async function bulkPackOrders() {
  if (selectedOrderIds.value.size === 0 || isBulkPacking.value)
    return;

  try {
    isBulkPacking.value = true;

    const orderIdsArray = Array.from(selectedOrderIds.value);
    let successCount = 0;
    let errorCount = 0;

    // Выполняем упаковку для каждого заказа - только отправляем /order/packed
    for (const orderId of orderIdsArray) {
      try {
        // Убираем updateOrderStatus, только отправляем уведомление о упаковке
        await orderService.notifyInvoicePacked(orderId);
        successCount++;

        // Показываем тоастер для каждого успешно упакованного заказа
        const packOrder = orders.value?.orders.find(o => o.id === orderId);
        const packOrderNumber = packOrder?.kaspi_code || orderId;
        toastSuccess(`Заказ ${packOrderNumber} успешно упакован!`);
      }
      catch (error) {
        console.error(`Ошибка при упаковке заказа ${orderId}:`, error);
        errorCount++;

        // Показываем тоастер об ошибке
        const errorPackOrder = orders.value?.orders.find(o => o.id === orderId);
        const errorPackOrderNumber = errorPackOrder?.kaspi_code || orderId;
        const errorMsg = error instanceof Error ? error.message : "Неизвестная ошибка";
        toastError(`Ошибка при упаковке заказа ${errorPackOrderNumber}: ${errorMsg}`);
      }
    }

    // Показываем итоговый результат
    if (successCount > 0) {
      toastSuccess(`✅ Успешно упаковано ${successCount} заказов!`);
    }
    if (errorCount > 0) {
      toastError(`Не удалось упаковать ${errorCount} из ${orderIdsArray.length} заказов`);
    }

    // Очищаем выбор и обновляем данные
    selectedOrderIds.value.clear();
    selectionMode.value = false;

    // Обновляем данные заказов
    console.warn("Обновляем данные заказов...");
    await refetchOrders();
  }
  catch (error) {
    console.error("Ошибка при массовой упаковке заказов:", error);
  }
  finally {
    isBulkPacking.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="mb-2 text-2xl font-bold">
          Заказы
        </h1>
        <div class="flex items-center gap-2">
          <span class="i-jq-calendar h-5 w-5 text-second" />
          <span class="text-base text-[#ABACAE]">
            Дата актуальности: {{ new Date().toLocaleDateString() }}
          </span>
        </div>
      </div>
      <div class="flex gap-3">
        <BaseButton
          v-if="!selectionMode"
          variant="secondary"
          @click="toggleSelectionMode"
        >
          <span class="i-jq-tick h-4 w-4" />
          Выбрать заказы
        </BaseButton>
        <BaseButton
          v-else
          variant="error-outline"
          @click="toggleSelectionMode"
        >
          <span class="i-jq-close h-4 w-4" />
          Отмена
        </BaseButton>
        <BaseButton variant="primary" @click="handleAddOrder">
          <span class="i-jq-plus-filled h-4 w-4" />
          Создать заказ
        </BaseButton>
      </div>
    </div>

    <!-- Панель массовых действий (показывается в режиме выбора) -->
    <div v-if="selectionMode" class="bg-blue-50 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="allOrdersSelected"
              :indeterminate="someOrdersSelected"
              class="h-4 w-4"
              @change="toggleAllOrders"
            >
            <span class="text-sm font-medium">
              Выбрать все ({{ selectedOrdersCount }} из {{ filteredOrders.length }})
            </span>
          </label>
        </div>
        <div class="flex gap-2">
          <!-- Кнопка для статуса "packaging" - Скачать накладные -->
          <BaseButton
            v-if="selectedOrdersCount > 0 && selectedTab === 'packaging'"
            variant="primary"
            :disabled="isBulkAssembling"
            @click="bulkAssembleOrders"
          >
            <span class="i-jq-download h-4 w-4" />
            {{ isBulkAssembling ? 'Обработка...' : `Скачать накладные (${selectedOrdersCount})` }}
          </BaseButton>

          <!-- Кнопка для статуса "assembly" - Собрать заказы -->
          <BaseButton
            v-if="selectedOrdersCount > 0 && selectedTab === 'assembly'"
            variant="primary"
            :disabled="isBulkPacking"
            @click="bulkPackOrders"
          >
            <span class="i-jq-tick h-4 w-4" />
            {{ isBulkPacking ? 'Упаковка...' : `Собрать заказы (${selectedOrdersCount})` }}
          </BaseButton>

          <!-- Старая кнопка массового скачивания (показывается для других статусов) -->
          <BaseButton
            v-if="selectedOrdersCount > 0 && !['packaging', 'assembly'].includes(selectedTab)"
            variant="primary"
            :disabled="isBulkDownloading"
            @click="bulkDownloadInvoices"
          >
            <span class="i-jq-download h-4 w-4" />
            {{ isBulkDownloading ? 'Скачивание...' : `Скачать накладные (${selectedOrdersCount})` }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="flex gap-4">
      <SummaryCard
        title="Всего заказов"
        :value="(orders?.pagination?.totalOrders || orders?.pagination?.total || 0).toString()"
        icon="i-jq-shopping-cart"
        icon-color="text-main"
      />
      <SummaryCard
        title="Кол-во заказов"
        value="0"
        change="+24.4%"
        icon="i-jq-bag-filled"
        icon-color="text-#EA6001"
      />
      <SummaryCard
        title="Оборот товаров"
        value="0"
        change="+24.4%"
        icon="i-jq-shopping-cart-filled"
        icon-color="text-#0A2635"
      />
      <SummaryCard
        title="Средний чек на товар"
        value="0 KZT"
        change="+24.4%"
        icon="i-jq-wallet"
        icon-color="text-#77BD8B"
      />
    </div>

    <SearchBar />
    <div class="flex flex-col gap-3">
      <FilterTabs
        v-model="selectedTab"
        :options="tabOptions"
        :disabled="isLoading"
      />

      <!-- Фильтр по экспресс заказам -->
      <FilterTabs
        v-model="expressFilter"
        :options="expressFilterOptions"
        :disabled="isLoading"
      />
    </div>

    <!-- Loading State (только для первой загрузки) -->
    <div v-if="isLoading && filteredOrders.length === 0" class="py-8 text-center">
      Загрузка...
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && !filteredOrders.length" class="py-8 text-center">
      Заказы не найдены
    </div>

    <!-- Orders List -->
    <div v-else-if="filteredOrders.length > 0" class="flex flex-col gap-y-3">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        :selectable="selectionMode"
        :selected="selectedOrderIds.has(order.id)"
        @toggle-selection="toggleOrderSelection"
      />

      <!-- Информация о пагинации -->
      <div v-if="orders?.pagination" class="py-4 text-center text-sm text-gray-500">
        Показано {{ filteredOrders.length }} из {{ orders.pagination.totalOrders || orders.pagination.total }} заказов
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
          :disabled="isLoading || isLoadingMore"
          @click="loadNextPage"
        >
          {{ isLoadingMore ? 'Загружаем...' : 'Загрузить еще' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: default
</route>
