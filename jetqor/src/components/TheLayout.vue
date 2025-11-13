<script setup lang="ts">
import type { BreadcrumbItem } from "~/types";
import { ref } from "vue";
import ChartContainer from "./charts/ChartContainer.vue";
import RevenueChart from "./charts/RevenueChart.vue";

const breadcrumbs = ref<BreadcrumbItem[]>([
  { label: "Главная", to: "/" },
  { label: "Статистика" },
]);

const period = ref("all");
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <TheBreadcrumbs :items="breadcrumbs" />
    <TheHeader v-model:period="period" />

    <main>
      <ChartContainer
        title="Общая выручка"
        subtitle="2 879 831 777 KZT"
      >
        <RevenueChart :data="chartData" />
      </ChartContainer>

      <div class="grid grid-cols-2 gap-6">
        <ChartContainer title="Заказы">
          <OrdersChart :data="ordersData" />
        </ChartContainer>

        <ChartContainer title="Динамика продаж">
          <SalesChart :data="salesData" />
        </ChartContainer>
      </div>
    </main>
  </div>
</template>
