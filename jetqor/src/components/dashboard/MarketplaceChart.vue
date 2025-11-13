<script setup lang="ts">
import { PieChart } from "echarts/charts";
import {
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

// Регистрируем компоненты ECharts
use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

const data: ChartDataItem[] = [
  { name: "Kaspi магазин", value: 15, color: "#FF6E4E" },
  { name: "Wildberries", value: 15, color: "#673AB3" },
  { name: "Ozon", value: 15, color: "#00A9F1" },
  { name: "Другое", value: 15, color: "#ABACAE" },
];

const options = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
  },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 0,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: true,
        position: "center",
        color: "#fff",
        formatter: "{c}",
      },
      data: data.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color,
        },
      })),
    },
  ],
}));
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <h3 class="mb-6 heading-4 text-second">
      Продажи по маркетплейсам
    </h3>
    <div class="h-80">
      <VChart class="h-full w-full" :option="options" autoresize />
    </div>
    <div class="mt-4 flex flex-col gap-2">
      <div
        v-for="item in data"
        :key="item.name"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div
            class="h-3 w-3 rounded-full"
            :style="{ backgroundColor: item.color }"
          />
          <span>{{ item.name }}</span>
        </div>
        <span>{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>
