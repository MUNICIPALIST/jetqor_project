<script setup lang="ts">
import type { ComponentOrder } from "../adapters/orderAdapter";

defineProps<{
  order: ComponentOrder;
}>();
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold">
        Информация о заказе
      </h2>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <div class="text-sm text-[#ABACAE]">
          Номер заказа
        </div>
        <div class="font-medium">
          {{ order.number }}
        </div>
      </div>

      <div>
        <div class="text-sm text-[#ABACAE]">
          Общая стоимость
        </div>
        <div class="font-medium">
          {{ order.price }}
        </div>
      </div>

      <div>
        <div class="text-sm text-[#ABACAE]">
          Дата создания
        </div>
        <div class="font-medium">
          {{ order.deliveryDate }}
        </div>
      </div>

      <div>
        <div class="text-sm text-[#ABACAE]">
          Платформа
        </div>
        <div class="font-medium">
          {{ order.platform }}
        </div>
      </div>

      <div>
        <div class="text-sm text-[#ABACAE]">
          Клиент
        </div>
        <div class="font-medium">
          {{ order.customer }}
        </div>
      </div>

      <div>
        <div class="text-sm text-[#ABACAE]">
          Локация
        </div>
        <div class="font-medium">
          {{ order.location }}
        </div>
      </div>
    </div>
  </div>
</template>
