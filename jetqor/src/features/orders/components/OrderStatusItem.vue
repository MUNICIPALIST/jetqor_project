<script lang="ts" setup>
const props = defineProps<{
  step: any;
  iconColor: string;
  buttonText: string;
  buttonProps: any;
  last: boolean;
  showButton?: boolean; // Новый пропс для управления видимостью кнопки
}>();

defineEmits<{
  (e: "click"): void;
}>();
const computedClassess = computed(() => [props.step.icon, props.iconColor]);
</script>

<template>
  <div class="relative w-64 flex flex-col items-center gap-4">
    <div
      class="size-14.5 flex items-center justify-center rounded-2 bg-grayscale-100 p2"
    >
      <div :class="computedClassess" class="size-full" />
    </div>

    <div class="whitespace-nowrap text-3.5 text-black fw-500">
      {{ step.label }}
    </div>

    <BaseButton
      v-if="showButton !== false && buttonText"
      v-bind="buttonProps"
      class="whitespace-nowrap !px-3.5 !py-3"
      @click="$emit('click')"
    >
      {{ buttonText }}
    </BaseButton>
  </div>
</template>

<style>

</style>
