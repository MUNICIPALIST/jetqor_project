<script setup lang="ts">
import { ref } from "vue";
import OrdersChart from "~/components/charts/OrdersChart.vue";

const period = ref("yearly");
const periodOptions = [
  { label: "По годам", value: "yearly" },
  { label: "По месяцам", value: "monthly" },
  { label: "По неделям", value: "weekly" },
  { label: "По всей стране", value: "country" },
];

const revenueData = ref([
  { year: 2015, revenue: 20, profit: 15 },
  { year: 2016, revenue: 25, profit: 20 },
  // ... Add more data points
]);

function downloadReport() {
  // Implementation for downloading report
  console.log("Downloading report...");
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="heading-2 text-second">
        Общая сводка информации
      </h1>
      <button
        class="flex items-center gap-2 rounded-lg bg-main px-4 py-2 text-white transition-colors hover:bg-main/90"
        @click="downloadReport"
      >
        <span class="i-jq-download shrink-0 text-4" />
        <span>Скачать общую сводку информации</span>
      </button>
    </div>

    <!-- Period selector -->
    <FilterTabs v-model="period" :options="periodOptions" />

    <!-- Main Content Layout: два столбца -->
    <div class="flex gap-6">
      <!-- Left Column: revenue chart, orders stats, sales dynamics (вертикально) -->
      <div class="flex flex-1 flex-col gap-6">
        <!-- Revenue Chart -->
        <div class="rounded-xl bg-white p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="heading-4 text-second">
                Общая выручка
              </h2>
              <div class="mt-2 flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-main" />
                  <span>Выручка</span>
                  <span class="text-second font-medium">2 879 831 777 KZT</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-green" />
                  <span>Прибыль</span>
                  <span class="text-second font-medium">1 645 821 546 KZT</span>
                </div>
              </div>
            </div>
          </div>
          <RevenueChart :data="revenueData" />
        </div>

        <!-- Orders Stats -->
        <div class="rounded-xl bg-white p-6">
          <h3 class="mb-4 heading-4 text-second">
            Заказы
          </h3>
          <div class="mb-4 flex gap-8">
            <div>
              <span class="text-gray-600">Выполненные заказы</span>
              <p class="heading-4 text-second">
                15
              </p>
            </div>
            <div>
              <span class="text-gray-600">Просроченные заказы</span>
              <p class="heading-4 text-red">
                15
              </p>
            </div>
          </div>
          <OrdersChart />
        </div>
        <!-- Sales Dynamics -->
        <div class="rounded-xl bg-white p-6">
          <h3 class="mb-4 heading-4 text-second">
            Динамика продаж
          </h3>
          <div class="mb-4 flex items-center gap-4">
            <div>
              <span class="text-gray-600">Сумма заказов</span>
              <p class="heading-4 text-second">
                2 879 831 777 KZT
              </p>
              <div>
                <span class="text-gray-600">Оборот заказов</span>
                <p class="heading-4 text-second">
                  510
                </p>
              </div>
            </div>
            <SalesChart />
          </div>
        </div>
      </div>
      <!-- Right Column: Right Side Stats -->
      <div class="w-300px overflow-y-auto border-l bg-white p-6">
        <div class="mb-8">
          <h3 class="mb-4 heading-4 text-second">
            Средний рейтинг отзывов
          </h3>
          <div class="mb-4 flex items-center gap-2">
            <span class="text-4xl text-second font-bold">4.7</span>
            <span class="i-jq-star text-2xl text-yellow-400" />
          </div>
          <div class="flex justify-between text-sm">
            <div>
              <p>31 Положительные</p>
              <p class="text-green">
                61.3%
              </p>
            </div>
            <div>
              <p>12 Отрицательные</p>
              <p class="text-red">
                38.7%
              </p>
            </div>
          </div>
        </div>
        <TopProducts class="mb-8" />
        <MarketplaceChart />
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: default
</route>
