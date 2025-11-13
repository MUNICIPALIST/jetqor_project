<script setup lang="ts">
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

// Регистрируем компоненты ECharts
use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

interface OrderData {
  period: string;
  completed: number;
  overdue: number;
}

const data: OrderData[] = [
  { period: "2019", completed: 35, overdue: 15 },
  { period: "2020", completed: 28, overdue: 12 },
  { period: "2021", completed: 20, overdue: 10 },
  { period: "2022", completed: 45, overdue: 18 },
  { period: "2023", completed: 25, overdue: 8 },
  { period: "2024", completed: 15, overdue: 10 },
];

const options = computed(() => ({
  grid: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 60,
    containLabel: true,
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    formatter: (params: any[]) => {
      return `
        <div class="p-4">
          <p class="text-gray-600">Период: ${params[0].axisValue}</p>
          ${params
    .map(
      param => `
            <p style="color: ${param.color}">
              ${param.seriesName}: ${param.value}
            </p>
          `,
    )
    .join("")}
        </div>
      `;
    },
  },
  legend: {
    data: ["Выполненные заказы", "Просроченные заказы"],
    bottom: 0,
  },
  xAxis: {
    type: "category",
    data: data.map(item => item.period),
  },
  yAxis: {
    type: "value",
    splitLine: {
      lineStyle: {
        type: "dashed",
      },
    },
  },
  series: [
    {
      name: "Выполненные заказы",
      type: "bar",
      data: data.map(item => item.completed),
      itemStyle: {
        color: "#77BD8B",
      },
    },
    {
      name: "Просроченные заказы",
      type: "bar",
      data: data.map(item => item.overdue),
      itemStyle: {
        color: "#FF6E4E",
      },
    },
  ],
}));
</script>

<template>
  <div class="h-80 w-full">
    <VChart class="h-full w-full" :option="options" autoresize />
  </div>
</template>
