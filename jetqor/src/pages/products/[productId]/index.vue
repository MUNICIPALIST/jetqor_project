<script lang="ts" setup>
import MarketplaceChart from "~/components/dashboard/MarketplaceChart.vue";
import ProductCardDetailed from "~/features/products/components/ProductCardDetailed.vue";
import ProductCardDetailedInfo from "~/features/products/components/ProductCardDetailedInfo.vue";
import ProductDetailsOrders from "~/features/products/components/ProductDetailsOrders.vue";
import { useProductQuery } from "~/features/products/queries/products";
import { useProductsStore } from "~/features/products/store/product";

useProductsStore();
const { data: product } = useProductQuery();

const tabOptions = [
  { label: "О Товаре", value: "product" },
  { label: "Заказы", value: "orders" },
];
const currentTab = ref(tabOptions[0].value);
const currentTabComponent = computed(() => {
  return currentTab.value === "orders" ? ProductDetailsOrders : ProductCardDetailedInfo;
});

// === NEW: вычисление остатков по складам ===
interface WarehouseStockItem { name: string; count: number }
const warehouseStocks = computed<WarehouseStockItem[]>(() => {
  const p: any = product.value;
  if (!p || !Array.isArray(p.entites))
    return [];
  const map: Record<string, WarehouseStockItem> = {};
  for (const entity of p.entites) {
    // ожидается структура entity.cell.storage.name (по вашему примеру)
    const storageName = entity?.cell?.storage?.name || "Неизвестный склад";
    if (!map[storageName]) {
      map[storageName] = { name: storageName, count: 0 };
    }
    map[storageName].count += entity.count || 0;
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
});

const totalStock = computed(() => warehouseStocks.value.reduce((s, w) => s + w.count, 0));
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-4">
      <div class="flex flex-1 flex-col gap-4">
        <ProductCardDetailed v-if="product" :product="product" />
        <div>
          <component :is="currentTabComponent" />
        </div>
      </div>
      <div class="w-1/3 flex flex-col gap-4">
        <div class="flex flex-col gap-3 border border-#EDF2F7 rounded-3 bg-white p6">
          <div class="text-5 text-h5 fw-700">
            Склады
          </div>
          <div v-if="warehouseStocks.length === 0" class="text-sm text-gray-500">
            Нет остатков
          </div>
          <template v-else>
            <LinkButton v-for="w in warehouseStocks" :key="w.name" show-arrow>
              {{ w.name }} - <span class="fw-500">{{ w.count }}</span>
            </LinkButton>
            <div class="mt-2 text-sm fw-600">
              Итого: {{ totalStock }}
            </div>
          </template>
        </div>
        <SalesChart />
        <MarketplaceChart />
      </div>
    </div>
  </div>
</template>

<style>

</style>

<route lang="yaml">
  meta:
    layout: small
</route>
