<script setup lang="ts">
import type { OrderProductDetails } from "../../store/orderProductDistribution";
import type { CellLocation, WarehouseCell, WarehouseRow } from "~/features/invoices/types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import CellProductsModal from "~/features/invoices/components/modals/CellProductsModal.vue";
import ShelfSelector from "~/features/invoices/components/warehouse/ShelfSelector.vue";
import WarehouseRows from "~/features/invoices/components/warehouse/WarehouseRows.vue";
import EmptyState from "~/features/warehouses/components/EmptyState.vue";
import { useWarehousesStore } from "~/features/warehouses/store/warehouses";
import { getProduct } from "../../../products/queries/products";
import { useOrderAssemblyModal } from "../../composables/useOrderAssemblyModal";
import { useOrderQuery } from "../../queries/orders";
import { useOrderProductDistributionStore } from "../../store/orderProductDistribution";
import OrderProductsList from "../products/OrderProductsList.vue";

const warehousesStore = useWarehousesStore();
const productDistributionStore = useOrderProductDistributionStore();
const orderQuery = useOrderQuery();
const router = useRouter();
const { closeModal } = useOrderAssemblyModal();

const isLoading = ref(true);
const orderProducts = ref<OrderProductDetails[]>([]);

// We get the order directly from the query now

// Fetch order data and products
onMounted(async () => {
  try {
    // Initialize warehouses
    warehousesStore.initWarehouses();

    // Wait for order query to finish
    await orderQuery.refetch();

    // Get the current order from query data
    const order = orderQuery.data.value;

    if (!order) {
      console.error("Order not found");
      isLoading.value = false;
      return;
    }

    // For each product in the order, fetch detailed product info
    const productsPromises = order.products.map(async (orderProduct) => {
      try {
        // Use the imported function from products.ts
        const productDetails = await getProduct(orderProduct.productId);
        if (productDetails) {
          // Add the order count to the product details
          return {
            ...productDetails,
            orderCount: orderProduct.count,
          } as OrderProductDetails;
        }
      }
      catch (err) {
        console.error(`Error fetching product ${orderProduct.productId}:`, err);
      }
      return null;
    });

    // Wait for all product details to be fetched
    const products = (await Promise.all(productsPromises)).filter(Boolean) as OrderProductDetails[];

    // Store the products in our ref and in the distribution store
    orderProducts.value = products;
    productDistributionStore.setOrderProducts(products);
  }
  catch (error) {
    console.error("Error loading order data:", error);
  }
  finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  productDistributionStore.clearDistribution();
});

function navigateToWarehouses() {
  closeModal();
  router.push("/warehouses");
}

const shelves = computed(() => {
  return warehousesStore.racksOptions.map(rack => ({
    id: rack.value,
    label: rack.label,
  }));
});

// Create a computed property to handle v-model for currentRackId
const currentRackId = computed({
  get: () => warehousesStore.currentRackId || shelves.value[0]?.id || 0,
  set: (value) => {
    warehousesStore.currentRackId = value;
  },
});

const formattedRows = computed<WarehouseRow[]>(() => {
  const warehouseRows = warehousesStore.warehouseRowsOnSelectedRack || [];
  return warehouseRows.map((row: any): WarehouseRow => {
    const cells: WarehouseCell[] = row.cells
      .filter((cell: any) => {
        // Показываем только ячейки, в которых есть товары из текущего заказа
        return hasOrderProductsInCell(cell.id);
      })
      .map((cell: any): WarehouseCell => {
        return {
          id: cell.id,
          name: `Ячейка ${cell.id}`,
          code: `C-${row.id}-${cell.id}`,
        };
      });
    return {
      id: row.id,
      label: `Ряд ${row.id}`,
      cells: cells.length,
      items: cells,
    };
  });
});

// Проверяет, есть ли в ячейке товары из текущего заказа
function hasOrderProductsInCell(cellId: number): boolean {
  // Получаем все товары из ячейки (это должен быть API-вызов к складу)
  const cellProducts = getCellInventory(cellId);

  // Проверяем, есть ли пересечение с товарами из заказа
  return orderProducts.value.some(orderProduct =>
    cellProducts.some(cellProduct => cellProduct.productId === orderProduct.id && cellProduct.quantity > 0),
  );
}

// Получает инвентарь ячейки (заглушка - нужно заменить на реальный API)
function getCellInventory(_cellId: number) {
  // TODO: Заменить на реальный API-вызов
  // Временная заглушка - возвращаем товары из заказа для демонстрации
  return orderProducts.value.map(product => ({
    productId: product.id,
    quantity: Math.floor(Math.random() * 10) + 1, // Случайное количество для демонстрации
  }));
}

const showModal = ref(false);
const currentCell = ref<CellLocation | null>(null);

function handleSelectCell(row: WarehouseRow, cell: WarehouseCell) {
  currentCell.value = {
    id: cell.id,
    name: cell.name,
    code: cell.code,
    warehouse: warehousesStore.currentWarehouse?.name || "Склад",
    shelf: warehousesStore.racksOptions.find(r => r.value === warehousesStore.currentRackId)?.label || "",
    row: row.label,
  };
  showModal.value = true;
}

// Добавляет товар из ячейки в список извлеченных товаров
function extractProductFromCell(cellId: number, productId: number) {
  const orderProduct = orderProducts.value.find(p => p.id === productId);
  if (!orderProduct)
    return;

  const currentExtracted = productDistributionStore.getTotalDistributedCount(productId);
  const maxCanExtract = orderProduct.orderCount;

  // Проверяем, можем ли мы извлечь еще один товар
  if (currentExtracted >= maxCanExtract) {
    return; // Уже извлечено максимальное количество
  }

  // Добавляем +1 товар в список извлеченных
  productDistributionStore.addProductToCell(
    productId,
    cellId,
    `C-${cellId}`,
    `Ячейка ${cellId}`,
    1,
  );
}

// Получает информацию о том, из каких ячеек извлечен конкретный товар
function getProductExtractions(productId: number) {
  return productDistributionStore.distributedProducts
    .filter(p => p.product_id === productId)
    .map(p => ({
      cellId: p.cell_id,
      count: p.count,
      cellName: p.cell_name || `Ячейка ${p.cell_id}`,
    }));
}

// Получает товары из ячейки, которые есть в заказе
function getOrderProductsInCell(cellId: number) {
  const cellInventory = getCellInventory(cellId);
  return cellInventory
    .filter(cellProduct =>
      orderProducts.value.some(orderProduct => orderProduct.id === cellProduct.productId),
    )
    .map((cellProduct) => {
      const orderProduct = orderProducts.value.find(op => op.id === cellProduct.productId);
      return {
        ...orderProduct!,
        availableInCell: cellProduct.quantity,
        extractedCount: productDistributionStore.getTotalDistributedCount(cellProduct.productId),
      };
    });
}

function handleClose() {
  showModal.value = false;
}

function handleSave(quantities?: Record<number, number>) {
  if (!quantities || !currentCell.value)
    return;

  // Process the selected quantities
  Object.entries(quantities).forEach(([productId, count]) => {
    if (count > 0) {
      productDistributionStore.addProductToCell(
        Number(productId),
        currentCell.value!.id,
        currentCell.value!.code,
        currentCell.value!.name,
        count,
      );
    }
  });

  showModal.value = false;
}
</script>

<template>
  <div class="h-full flex gap-3">
    <!-- Левая часть: управление складом -->
    <div class="h-[calc(100vh-120px)] flex-1 overflow-y-auto pb-20 space-y-3">
      <!-- Если нет складов -->
      <EmptyState
        v-if="!warehousesStore.warehouses?.length"
        icon="card-box"
        title="Нет доступных складов"
        description="Сначала необходимо добавить склад в систему"
      >
        <BaseButton variant="primary" @click="navigateToWarehouses">
          Перейти к управлению складами
        </BaseButton>
      </EmptyState>
      <template v-else>
        <!-- Выбор стеллажей -->
        <ShelfSelector
          v-if="shelves.length"
          v-model="currentRackId"
          :shelves="shelves"
        />
        <!-- Если нет стеллажей -->
        <EmptyState
          v-else
          icon="card-box"
          title="Нет стеллажей на складе"
          description="Сначала добавьте стеллажи для этого склада"
        >
          <BaseButton variant="primary" @click="navigateToWarehouses">
            Перейти к управлению складами
          </BaseButton>
        </EmptyState>
        <!-- Если нет рядов на выбранном стеллаже -->
        <EmptyState
          v-if="shelves.length && formattedRows.length === 0"
          icon="category"
          title="Нет рядов на стеллаже"
          description="Сначала добавьте ряды для выбранного стеллажа"
        >
          <BaseButton variant="primary" @click="navigateToWarehouses">
            Перейти к управлению складами
          </BaseButton>
        </EmptyState>
        <!-- Ряды и ячейки склада -->
        <WarehouseRows
          v-else-if="formattedRows.length > 0"
          :rows="formattedRows"
          @select-cell="handleSelectCell"
        >
          <!-- Слот для отображения информации о ячейке -->
          <template #cell-content="{ cell }">
            <!-- Отображаем товары из заказа, которые есть в данной ячейке -->
            <div v-if="getOrderProductsInCell(cell.id).length > 0" class="p-2 space-y-2">
              <div
                v-for="product in getOrderProductsInCell(cell.id)"
                :key="`${cell.id}-${product.id}`"
                class="flex items-center justify-between rounded-lg bg-white p-2 text-sm"
              >
                <div class="flex items-center gap-2">
                  <div class="h-6 w-6 rounded bg-grayscale-100" />
                  <div>
                    <div class="text-xs font-medium">
                      {{ product.name }}
                    </div>
                    <div class="text-xs text-grey">
                      Доступно: {{ product.availableInCell }} шт.
                    </div>
                    <div class="text-green-600 text-xs">
                      Извлечено: {{ product.extractedCount }}/{{ product.orderCount }}
                    </div>
                  </div>
                </div>
                <button
                  v-if="product.extractedCount < product.orderCount"
                  class="btn btn-primary btn-sm"
                  @click.stop="extractProductFromCell(cell.id, product.id)"
                >
                  +1
                </button>
                <span v-else class="text-green-600 text-xs">Готово</span>
              </div>
            </div>
            <div v-else class="flex items-center justify-center p-2 text-xs text-grey">
              Нет товаров из заказа
            </div>
          </template>
        </WarehouseRows>
      </template>
    </div>

    <!-- Правая часть: список товаров -->
    <div class="h-[calc(100vh-120px)] w-[350px] overflow-y-auto">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          Извлеченные товары
        </h3>
        <div class="text-sm text-grey">
          Собрано: {{ productDistributionStore.fullyDistributedProductsCount }} / {{ orderProducts.length }}
        </div>
      </div>

      <OrderProductsList
        v-if="orderProducts.length > 0"
        :products="orderProducts"
      >
        <!-- Слот для отображения состояния извлечения товара -->
        <template #product-info="{ product }">
          <div class="text-sm">
            <div class="flex justify-between">
              <span>Нужно собрать:</span>
              <span>{{ product.orderCount }} шт.</span>
            </div>
            <div class="flex justify-between">
              <span>Собрано:</span>
              <span class="text-green-600">{{ productDistributionStore.getTotalDistributedCount(product.id) }} шт.</span>
            </div>
            <div class="flex justify-between">
              <span>Осталось:</span>
              <span class="text-orange-600">{{ productDistributionStore.getRemainingCount(product.id) }} шт.</span>
            </div>

            <!-- Показываем из каких ячеек извлечены товары -->
            <div v-if="productDistributionStore.getProductsInCell" class="mt-2 space-y-1">
              <div class="text-xs text-gray-500">
                Извлечено из ячеек:
              </div>
              <div
                v-for="extraction in getProductExtractions(product.id)"
                :key="`${extraction.cellId}-${product.id}`"
                class="flex justify-between text-xs"
              >
                <span>Ячейка {{ extraction.cellId }}:</span>
                <span>{{ extraction.count }} шт.</span>
              </div>
            </div>
          </div>
        </template>
      </OrderProductsList>

      <EmptyState
        v-else-if="isLoading"
        icon="shopping-cart"
        title="Загрузка..."
        description="Подождите, идет загрузка товаров..."
      />

      <EmptyState
        v-else
        icon="shopping-cart"
        title="Нет товаров"
        description="В этом заказе пока нет товаров для сборки"
      />
    </div>
  </div>

  <!-- Модальное окно для выбора товаров -->
  <CellProductsModal
    :show-modal="showModal"
    :cell-location="currentCell"
    :products="orderProducts.map(p => ({ ...p, invoiceCount: p.orderCount, handled: false, handled_count: 0 }))"
    @update:show-modal="showModal = $event"
    @close="handleClose"
    @save="handleSave"
  />
</template>
