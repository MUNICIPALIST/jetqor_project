<script setup lang="ts">
import type { CellLocation, InvoiceProductDetails, WarehouseCell, WarehouseRow } from "../../types";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import EmptyState from "~/features/warehouses/components/EmptyState.vue";
import { useWarehousesStore } from "~/features/warehouses/store/warehouses";
import { useAddProductsModal } from "../../composables/useAddProductsModal";
import { invoiceService } from "../../services/invoiceService";
import { useDetailedProductsStore } from "../../store/detailedProducts";
import { useProductDistributionStore } from "../../store/productDistribution";
import InvoiceProductsList from "../products/InvoiceProductsList.vue";
import ShelfSelector from "../warehouse/ShelfSelector.vue";
import WarehouseRows from "../warehouse/WarehouseRows.vue";
import CellProductsModal from "./CellProductsModal.vue";

const warehousesStore = useWarehousesStore();
const productDistributionStore = useProductDistributionStore();
const detailedProductsStore = useDetailedProductsStore();
const router = useRouter();
const route = useRoute();
const { closeModal } = useAddProductsModal();

// Get the invoice ID from the route or props
// @ts-ignore - Ignore type error with route.params to make it work
const invoiceId = Number(route.params.id);

onMounted(async () => {
  warehousesStore.initWarehouses();
  await detailedProductsStore.fetchProducts(invoiceId);

  // Get invoice details to get the correct storageId
  try {
    const invoice = await invoiceService.getInvoiceById(invoiceId);

    // If the invoice has a storageId, set it as the current warehouse
    if (invoice.storageId) {
      console.warn(`Setting warehouse ID to ${invoice.storageId} from invoice`);
      warehousesStore.currentWarehouseId = invoice.storageId;
    }
  }
  catch (error) {
    console.error("Error fetching invoice details:", error);
  }

  productDistributionStore.setInvoiceProducts(detailedProductsStore.products);
});

onUnmounted(() => {
  detailedProductsStore.clearProducts();
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
    const cells: WarehouseCell[] = row.cells.map((cell: any): WarehouseCell => {
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

function handleClose() {
  showModal.value = false;
}

function getProductsInCell(cellId: number) {
  return productDistributionStore.getProductsInCell(cellId);
}

function getProductDetails(productId: number) {
  return detailedProductsStore.products.find(p => p.id === productId);
}

function removeProductFromCell(productId: number, cellId: number) {
  productDistributionStore.removeProductFromCell(productId, cellId);
}

function handleSave(quantities?: Record<number, number>) {
  if (!quantities || !currentCell.value)
    return;
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
            <!-- Отображаем продукты, распределенные в данную ячейку -->
            <div v-if="getProductsInCell(cell.id).length > 0" class="p-2">
              <div
                v-for="product in getProductsInCell(cell.id)" :key="`${product.cell_id}-${product.product_id}`"
                class="mb-2 flex items-center justify-between rounded-lg bg-white p-2 text-sm"
              >
                <div class="flex items-center">
                  <div class="mr-2 h-6 w-6 rounded bg-grayscale-100" />
                  <div>
                    <div class="font-medium">
                      {{ getProductDetails(product.product_id)?.name }}
                    </div>
                    <div class="text-xs text-grey">
                      {{ product.count }} шт.
                    </div>
                  </div>
                </div>
                <button
                  class="text-red-500 hover:text-red-700 text-xs"
                  @click.stop="removeProductFromCell(product.product_id, product.cell_id)"
                >
                  Убрать
                </button>
              </div>
            </div>
            <div v-else class="flex items-center justify-center p-2 text-xs text-grey">
              Нет товаров
            </div>
          </template>
        </WarehouseRows>
      </template>
    </div>
    <!-- Правая часть: список товаров -->
    <div class="h-[calc(100vh-120px)] w-[350px] overflow-y-auto">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          Товары в накладной
        </h3>
        <div class="text-sm text-grey">
          Распределено: {{ productDistributionStore.fullyDistributedProductsCount }} / {{ detailedProductsStore.products.length }}
        </div>
      </div>
      <InvoiceProductsList
        v-if="detailedProductsStore.products.length > 0"
        :products="detailedProductsStore.products"
      >
        <!-- Слот для отображения состояния распределения товара -->
        <template #product-info="{ product }">
          <div class="text-sm">
            <div class="flex justify-between">
              <span>Всего:</span>
              <span>{{ product.invoiceCount }} шт.</span>
            </div>
            <div class="flex justify-between">
              <span>Распределено:</span>
              <span>{{ productDistributionStore.getTotalDistributedCount(product.id) }} шт.</span>
            </div>
            <div class="flex justify-between">
              <span>Осталось:</span>
              <span>{{ productDistributionStore.getRemainingCount(product.id) }} шт.</span>
            </div>
          </div>
        </template>
      </InvoiceProductsList>
      <EmptyState
        v-else-if="detailedProductsStore.isLoading"
        icon="shopping-cart"
        title="Загрузка..."
        description="Подождите, идет загрузка товаров..."
      />
      <EmptyState
        v-else
        icon="shopping-cart"
        title="Нет товаров"
        description="В накладной пока нет товаров для распределения"
      />
    </div>
  </div>
  <!-- Модальное окно для выбора товаров -->
  <CellProductsModal
    :show-modal="showModal"
    :cell-location="currentCell"
    :products="detailedProductsStore.products"
    @update:show-modal="showModal = $event"
    @close="handleClose"
    @save="handleSave"
  />
</template>
