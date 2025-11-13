<script lang="ts" setup>
import OrderPlatform from "./OrderPlatform.vue";
import OrderStatus from "./OrderStatus.vue";

interface Order {
  id: number;
  number: string;
  price: string;
  status: string;
  platform: string;
  items: number;
  deliveryDate: string;
  location: string;
  customer: string;
  express: boolean;
}

interface Props {
  order: Order;
  selectable?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  selected: false,
});

const emit = defineEmits<{
  (e: "toggleSelection", orderId: number, selected: boolean): void;
}>();

function handleSelectionChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("toggleSelection", props.order.id, target.checked);
}

function handleCardClick() {
  if (props.selectable) {
    emit("toggleSelection", props.order.id, !props.selected);
  }
}
</script>

<template>
  <div
    class="min-h-180px flex justify-between gap-6 border border-#EEEEEE rounded-4 bg-white p-6 transition-all duration-200"
    :class="{
      'border-main bg-blue-50': selectable && selected,
      'cursor-pointer hover:border-main/50': selectable,
      'hover:shadow-md': !selectable,
    }"
    @click="handleCardClick"
  >
    <!-- Checkbox для выбора (если включен режим выбора) -->
    <div v-if="selectable" class="flex items-start pt-1">
      <input
        type="checkbox"
        :checked="selected"
        class="h-4 w-4"
        @change="handleSelectionChange"
        @click.stop
      >
    </div>

    <RouterLink
      :to="`/orders/${order.id}`"
      class="flex flex-1 justify-between gap-6"
      :class="{ 'pointer-events-none': selectable }"
      @click.stop="!selectable && $event"
    >
      <div class="flex flex-1 flex-col gap-4">
        <div class="text-4.5 text-#1E1E1E fw-600">
          № {{ order.number }}
        </div>
        <div class="text-4.5 text-#1E1E1E fw-500">
          {{ order.price }}
        </div>
        <div class="h-7.5 flex items-center gap-1.5">
          <OrderStatus :status="order.status as any" type="order" />
          <OrderPlatform :platform="order.platform" />
          <div class="h-full flex flex items-center justify-center gap-1 rounded-1 bg-grayscale-100 p2">
            <div class="i-jq-shopping-cart-filled mr-1 text-xs text-black" />
            <div>{{ order.items }}</div>
          </div>
          <div class="h-full flex items-center justify-center gap-1 rounded-1 p2" :class="order.express ? 'bg-orange-100 text-orange-700' : 'bg-grayscale-100 text-gray-600'">
            <div class="mr-1 text-xs" :class="order.express ? 'i-jq-car-delivery text-orange-600' : 'i-jq-car text-gray-500'" />
            <div class="text-xs font-medium">
              {{ order.express ? 'Экспресс' : 'Обычная' }}
            </div>
          </div>
        </div>
        <div class="h-1px w-full bg-#F5F5F5" />
        <div class="mb-2 flex gap-6">
          <div class="flex items-center gap-2 text-xs text-#1E1E1E fw-500">
            <div class="i-jq-calendar-filled text-5 text-second" />
            <div>Дата передачи: {{ order.deliveryDate }}</div>
          </div>
          <div class="flex items-center gap-2">
            <div class="i-jq-location text-black" />
            <div>{{ order.location }}</div>
          </div>
          <div class="flex items-center gap-2">
            <div class="i-jq-user text-black" />
            <div>{{ order.customer }}</div>
          </div>
        </div>
      </div>

      <div class="h-full min-h-180px w-[1px] bg-grayscale-100" />

      <div class="flex flex-col items-end justify-between">
        <BaseButton
          variant="secondary"
          icon="i-jq-download"
          :class="{ 'pointer-events-none opacity-50': selectable }"
          @click.stop
        >
          Скачать маркировку
        </BaseButton>
        <BaseButton
          class="w-fit"
          :class="{ 'pointer-events-none opacity-50': selectable }"
          @click.stop
        >
          Подробнее
        </BaseButton>
      </div>
    </RouterLink>
  </div>
</template>
