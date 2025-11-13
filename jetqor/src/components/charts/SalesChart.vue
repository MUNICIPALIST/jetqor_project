<script setup lang="ts">
import { LineChart } from "echarts/charts";
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
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

interface SalesData {
  period: string;
  orderSum: number;
  orderVolume: number;
}

const data: SalesData[] = [
  { period: "2020", orderSum: 80, orderVolume: 100 },
  { period: "2021", orderSum: 150, orderVolume: 120 },
  { period: "2022", orderSum: 90, orderVolume: 140 },
  { period: "2023", orderSum: 120, orderVolume: 80 },
  { period: "2024", orderSum: 70, orderVolume: 60 },
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
    data: ["Сумма заказов", "Оборот заказов"],
    bottom: 0,
  },
  xAxis: {
    type: "category",
    data: data.map(item => item.period),
    boundaryGap: false,
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
      name: "Сумма заказов",
      type: "line",
      smooth: true,
      data: data.map(item => item.orderSum),
      symbolSize: 8,
      itemStyle: {
        color: "#0A2635",
      },
      lineStyle: {
        width: 2,
      },
    },
    {
      name: "Оборот заказов",
      type: "line",
      smooth: true,
      data: data.map(item => item.orderVolume),
      symbolSize: 8,
      itemStyle: {
        color: "#77BD8B",
      },
      lineStyle: {
        width: 2,
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
