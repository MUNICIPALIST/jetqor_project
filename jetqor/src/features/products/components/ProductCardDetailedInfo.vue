<script lang="ts" setup>
import UIPanel from "~/components/ui/UIPanel.vue";
import { useProductQuery } from "../queries/products";
import ProductCardDetailedInfoItem from "./ProductCardDetailedInfoItem.vue";

const isOpen = ref(true);

const { data: product } = useProductQuery();

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT" }).format(price);
}
</script>

<template>
  <UIPanel v-model="isOpen">
    <template #header>
      О товаре
    </template>
    <div class="flex flex-col gap-3">
      <!-- Основная информация -->
      <div class="border-b border-gray-200 pb-3">
        <h3 class="mb-3 text-sm text-gray-500 font-medium">
          Основная информация
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <ProductCardDetailedInfoItem v-if="product?.name" title="Наименование:" :value="product.name" />
          <ProductCardDetailedInfoItem v-if="product?.article" title="Артикул:" :value="product.article" />
          <ProductCardDetailedInfoItem v-if="product?.price" title="Цена:" :value="formatPrice(product.price)" />
          <ProductCardDetailedInfoItem v-if="product?.description" title="Описание:" :value="product.description" />
          <ProductCardDetailedInfoItem title="Продажи за месяц:" :value="product?.sells_count_month || 0" />
          <ProductCardDetailedInfoItem
            v-if="product?.last_sell_dt"
            title="Последняя продажа:"
            :value="new Date(product.last_sell_dt).toLocaleDateString()"
          />
        </div>
      </div>

      <!-- Размеры и вес -->
      <div class="border-b border-gray-200 pb-3">
        <h3 class="mb-3 text-sm text-gray-500 font-medium">
          Размеры и вес
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <ProductCardDetailedInfoItem v-if="typeof product?.width !== 'undefined'" title="Ширина:" :value="`${product.width} см`" />
          <ProductCardDetailedInfoItem v-if="typeof product?.height !== 'undefined'" title="Высота:" :value="`${product.height} см`" />
          <ProductCardDetailedInfoItem v-if="typeof product?.length !== 'undefined'" title="Длина:" :value="`${product.length} см`" />
          <ProductCardDetailedInfoItem v-if="typeof product?.volume !== 'undefined'" title="Объем:" :value="`${product.volume} см³`" />
          <ProductCardDetailedInfoItem v-if="typeof product?.weight !== 'undefined'" title="Вес:" :value="`${product.weight} г`" />
        </div>
      </div>

      <!-- Интеграции -->
      <div v-if="false">
        <h3 class="mb-3 text-sm text-gray-500 font-medium">
          Интеграции
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <ProductCardDetailedInfoItem
            title="Kaspi магазин:"
            :value="product?.integration_kaspi ? 'Подключено' : 'Не подключено'"
          />
          <ProductCardDetailedInfoItem
            title="Wildberries:"
            :value="product?.integration_wildberries ? 'Подключено' : 'Не подключено'"
          />
          <ProductCardDetailedInfoItem
            title="Ozon:"
            :value="product?.integration_ozon ? 'Подключено' : 'Не подключено'"
          />
        </div>
      </div>
    </div>
  </UIPanel>
</template>
