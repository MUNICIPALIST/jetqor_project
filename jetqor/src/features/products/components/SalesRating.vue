<script lang="ts" setup>
interface Props {
  rating: number;
  total: number;
}

const props = withDefaults(defineProps<Props>(), {
  rating: 200,
  total: 2827,
});

const percentage = computed(() => (props.rating / props.total) * 100);
</script>

<template>
  <div class="flex flex-col gap-3 pt-3">
    <div class="text-info text-sm fw-500">
      Рейтинг по продажам:
    </div>
    <div class="flex flex-col gap-2">
      <div class="relative h-2.5 w-full rounded-3 from-red via-yellow to-green bg-gradient-to-r" />
      <div class="w-full flex" :style="{ paddingLeft: `calc(${percentage}% - 8px)` }">
        <div class="i-jq-chevron-up text-green" />
      </div>
    </div>
    <div class="flex flex-col justify-center gap-2 text-1rem text-green">
      <div><span class="fw-700">{{ props.rating }} место </span><span class="text-info fw-600">из {{ props.total }}</span></div>
    </div>
  </div>
</template>
