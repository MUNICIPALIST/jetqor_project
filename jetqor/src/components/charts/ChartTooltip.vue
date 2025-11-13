<script setup lang="ts">
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      year: string;
      revenue: number;
      profit: number;
    };
  }>;
}

defineProps<TooltipProps>();
</script>

<template>
  <div
    v-if="active && payload?.[0]?.payload"
    class="border rounded-lg bg-white p-4 shadow-lg"
  >
    <p class="text-gray-600">
      Year: {{ payload[0].payload.year }}
    </p>
    <p class="text-main">
      Revenue: {{ Number(payload[0].payload.revenue).toLocaleString() }} KZT
    </p>
    <p class="text-green">
      Profit: {{ Number(payload[0].payload.profit).toLocaleString() }} KZT
    </p>
  </div>
</template>
