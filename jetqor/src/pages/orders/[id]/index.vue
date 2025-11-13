<script setup lang="ts">
import type { ComponentOrder } from "@/features/orders/adapters/orderAdapter";
import BaseButton from "@/components/ui/BaseButton/index.vue";

import { adaptOrder } from "@/features/orders/adapters/orderAdapter";
import { useOrderQuery } from "@/features/orders/queries/orders";
import { computed } from "vue";

import OrderCardDetailedInfo from "~/features/orders/components/OrderCardDetailedInfo.vue";
import OrderStatus from "~/features/orders/components/OrderStatus.vue";
import OrderStatusDetailed from "~/features/orders/components/OrderStatusDetailed.vue";

const { data: order, isLoading } = useOrderQuery();

const currentOrder = computed<ComponentOrder | null>(() => {
  if (!order.value)
    return null;
  return adaptOrder(order.value);
});
</script>

<template>
  <div class="flex flex-col gap-4 p8 pl-30 pr-20px">
    <div class="flex gap-4">
      <div class="flex flex-1 flex-col gap-3">
        <!-- Loading State -->
        <div v-if="isLoading" class="py-8 text-center">
          Загрузка...
        </div>

        <!-- Error State -->
        <div v-else-if="!currentOrder" class="py-8 text-center">
          Заказ не найден
        </div>

        <template v-else>
          <!-- Title and Status -->
          <div class="flex justify-between gap-4 rounded-3 bg-white p6">
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="text-h4 fw-700">
                  № {{ currentOrder.number }}
                </div>
                <OrderStatus :status="currentOrder.status" type="order" />
              </div>
              <div class="text-4.5 fw-500">
                {{ currentOrder.price }}
              </div>
            </div>

            <div>
              <BaseButton icon="i-jq-download">
                Скачать накладную
              </BaseButton>
            </div>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-8 rounded-3 bg-white px-4 py-5">
            <div class="text-4.5 text-black fw-600">
              Статус заказа
            </div>

            <div class="max-w-58vw overflow-x-auto overflow-y-clip pb-6">
              <OrderStatusDetailed :status="currentOrder.status" />
            </div>
          </div>

          <!-- Order Info -->
          <OrderCardDetailedInfo :order="currentOrder" />
        </template>
      </div>

      <!-- Right Side -->
      <div v-if="currentOrder" class="w-1/3 flex flex-col gap-4">
        <!-- Customer -->
        <div class="flex flex-col gap-3 border border-#EDF2F7 rounded-3 bg-white p6">
          <div class="text-h5 fw-700">
            Клиент
          </div>
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 flex items-center justify-center rounded-full bg-[#F5F5F5]">
              <span>{{ currentOrder.customer[0] }}</span>
            </div>
            <div>
              <div class="font-medium">
                {{ currentOrder.customer }}
              </div>
              <div class="text-sm text-gray-500">
                Покупатель
              </div>
            </div>
          </div>
        </div>

        <!-- Products -->
        <div class="flex flex-col gap-3 border border-#EDF2F7 rounded-3 bg-white p6">
          <div class="text-h5 fw-700">
            Товары в заказе
          </div>
          <div class="text-sm text-gray-500">
            Всего товаров: {{ currentOrder.items }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: small
</route>
