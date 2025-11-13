<script setup lang="ts">
import type { ChartData } from "~/types";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

const props = defineProps<{
  data: ChartData[];
}>();

// Регистрируем компоненты ECharts
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

// Преобразуем данные в формат ECharts
const options = computed(() => ({
  grid: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 10,
    containLabel: true,
  },
  tooltip: {
    trigger: "axis",
    formatter: (params: any[]) => {
      return `
        <div class="p-2">
          <div class="font-medium">${params[0].axisValue}</div>
          ${params
    .map(
      param => `
            <div class="flex items-center gap-2 mt-1">
              <span style="color: ${param.color}">●</span>
              <span>${param.seriesName}: ${param.value}</span>
            </div>
          `,
    )
    .join("")}
        </div>
      `;
    },
  },
  legend: {
    data: ["Revenue", "Profit"],
    bottom: 0,
  },
  xAxis: {
    type: "category",
    data: props.data.map(item => item.year),
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
      name: "Revenue",
      type: "line",
      smooth: true,
      data: props.data.map(item => item.revenue),
      symbolSize: 8,
      itemStyle: {
        color: "#EA6001",
      },
      lineStyle: {
        width: 2,
      },
    },
    {
      name: "Profit",
      type: "line",
      smooth: true,
      data: props.data.map(item => item.profit),
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
  <div class="h-96 w-full">
    <VChart class="h-full w-full" :option="options" autoresize />
  </div>
</template>
