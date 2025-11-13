<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "error-outline";
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
  disabled: false,
  loading: false,
  size: "md",
});
</script>

<template>
  <button
    class="flex items-center justify-center gap-2 rounded-xl font-semibold"
    :class="{
      // Размеры
      'h-10 px-2.5 py-2 text-sm': size === 'sm',
      'h-[48px] px-3.5 py-3 text-base leading-[1.4em] tracking-[1.4%]': size === 'md',
      'h-14 px-4 py-3.5 text-lg': size === 'lg',

      // Варианты
      'bg-main text-white': variant === 'primary' && !disabled && !loading,
      'bg-background text-black': variant === 'secondary' && !disabled && !loading,
      'border border-error/10 bg-error/10 text-error': variant === 'error-outline' && !disabled && !loading,

      // Состояния
      'pointer-events-none bg-grayscale-100 text-second': disabled,
      'pointer-events-none': loading,
      'bg-main/70 text-white': variant === 'primary' && loading,
      'bg-background/70 text-black/70': variant === 'secondary' && loading,
      'border border-error/10 bg-error/5 text-error/70': variant === 'error-outline' && loading,
    }"
    :disabled="disabled || loading"
  >
    <!-- Индикатор загрузки -->
    <template v-if="loading">
      <div class="mr-2 size-5 animate-spin border-2 border-current border-t-transparent rounded-full" />
    </template>

    <slot />
  </button>
</template>
