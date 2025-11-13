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

const baseClasses = "inline-flex items-center justify-between gap-2 rounded-xl transition-colors active:animate-bounce-rotate active:animate-duration-300 active:animate-ease-bounce-rotate";

const sizeClasses = computed(() => ({
  lg: "h-15 p-3 !gap-18px",
  default: "h-15 p-4 gap-2.5",
  icon: "h-15 w-15 p4 gap-2.5",
})[props.size]);

const variantClasses = computed(() => ({
  default: "bg-background hover:bg-grayscale-200 text-black",
  ghost: "bg-transparent hover:bg-background/30",
})[props.variant]);

const buttonClasses = computed(() => [
  baseClasses,
  sizeClasses.value,
  variantClasses.value,
  props.disabled && "opacity-50 cursor-not-allowed",
  props.icon && "!items-center !justify-center",
]);
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
  >
    <div
      v-if="icon" class="text-black" :class="[icon]"
    />

    <img
      v-if="avatar?.src"
      :src="avatar.src"
      :alt="avatar.fallback"
      class="size-9 flex items-center justify-center rounded-lg bg-white"
      onerror="this.style.display='none'"
    >
    <div
      v-if="avatar"
      class="size-9 flex items-center justify-center rounded-lg bg-white text-h5 fw-700 leading-none"
    >
      <span class="mb--0.2rem">{{ avatar?.fallback }}</span>
    </div>

    <template v-if="$slots.default || subtitle">
      <div class="flex flex-col items-start justify-start">
        <span class="mb--0.2rem inline-flex justify-center gap-2 text-h6 fw-600 leading-none">
          <slot />
        </span>
        <span
          v-if="subtitle"
          class="pt-1 text-sm text-grey"
        >
          {{ subtitle }}
        </span>
      </div>
    </template>

    <div v-if="showArrow" class="ml-auto size-6 flex shrink-0 items-center justify-center">
      <div
        class="i-jq-chevron-right h-14px w-14px text-black"
      />
    </div>
  </button>
</template>
