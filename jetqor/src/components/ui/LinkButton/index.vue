<script setup lang="ts">
type ButtonVariant = "default" | "ghost";
type ButtonSize = "icon" | "default" | "lg";

interface ButtonAvatar {
  src?: string;
  fallback: string;
}

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  icon?: string;
  avatar?: ButtonAvatar;
  subtitle?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "default",
  size: "default",
  showArrow: false,
  disabled: false,
});

const baseClasses = "inline-flex items-center justify-between gap-2 rounded-xl transition-colors";

const sizeClasses = computed(() => ({
  lg: "h-15 p-3 !gap-18px",
  default: "h-15 p-4 gap-2.5",
  icon: "h-15 w-15 p4 gap-2.5",
})[props.size]);

const variantClasses = computed(() => ({
  default: "bg-background  text-black",
  ghost: "bg-transparent hover:bg-background/30",
})[props.variant]);

const buttonClasses = computed(() => [
  baseClasses,
  sizeClasses.value,
  variantClasses.value,
  props.disabled && "opacity-50 cursor-not-allowed",
]);
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
  >
    <template v-if="$slots.default || subtitle">
      <div class="flex flex-col items-start justify-start">
        <span class="mb--0.2rem inline-flex justify-center gap-2 text-h6 fw-600 leading-none">
          <slot />
        </span>
        <span
          v-if="subtitle"
          class="text-sm text-grey"
        >
          {{ subtitle }}
        </span>
      </div>
    </template>

    <div v-if="showArrow" class="size-6 flex shrink-0 items-center justify-center">
      <div
        class="i-jq-chevron-right h-14px w-14px text-main"
      />
    </div>
  </button>
</template>
