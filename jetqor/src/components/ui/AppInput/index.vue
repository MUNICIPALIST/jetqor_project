<script setup lang="ts">
import type { MaskOptions } from "maska";
import { computed, ref } from "vue";

interface Props {
  type?: "text" | "password" | "email" | "tel";
  label?: string;
  placeholder?: string;
  mask?: string | string[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  autocomplete?: string;
  maskaOptions?: MaskOptions;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  id: `input-${Math.random().toString(36).substr(2, 9)}`,
});

const model = defineModel<string | number>();
const inputRef = ref<HTMLInputElement>();
const unmaskedValue = ref<string>("");
const showPassword = ref(false);
const isActive = ref(false);

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function handleFocus() {
  isActive.value = true;
}

function handleBlur() {
  isActive.value = false;
}

const inputType = computed(() => {
  if (props.type === "password") {
    return showPassword.value ? "text" : "password";
  }
  return props.type;
});

const isFilled = computed(() => !!model.value);

defineExpose({
  unmaskedValue,
  focus: () => inputRef.value?.focus(),
});
</script>

<template>
  <div class="w-full">
    <div
      class="relative flex items-center gap-3 rounded-4 border-none bg-grayscale-100 p5 outline-0 transition-all duration-100"
      :class="{
        'outline-1 outline-solid outline-grayscale-400': isActive,
      }"
    >
      <div
        v-if="props.type === 'text'"
        class="i-jq-user size-6 transition-colors" :class="[
          isFilled ? 'text-main' : 'text-grey',
        ]"
      />
      <div
        v-if="props.type === 'email'"
        class="i-jq-message size-6 transition-colors" :class="[
          isFilled ? 'text-main' : 'text-grey',
        ]"
      />
      <div
        v-if="props.type === 'password'"
        class="i-jq-lock size-6 transition-colors" :class="[
          isFilled ? 'text-main' : 'text-grey',
        ]"
      />
      <input
        :id="id"
        ref="inputRef"
        v-model="model"
        v-maska="maskaOptions"
        v-maska.modifier.unmasked="unmaskedValue"
        v-bind="$attrs"
        :value="model"
        :type="inputType"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="w-full border-none bg-grayscale-100 text-4 text-black fw-600 tracking-0.2px"
        :class="[
          error
            ? 'border-red focus:ring-red focus:border-red'
            : 'border-grey focus:outline-none focus:ring-none focus:border-none',
          disabled ? 'bg-grayscale-100 cursor-not-allowed' : '',

        ]"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <div
        v-if="props.type === 'password'"
        class="absolute right-2.5 flex cursor-pointer items-center"
        :class="isFilled ? 'text-main' : 'text-grey'"
        @click="togglePasswordVisibility"
      >
        <div :class="showPassword ? 'i-jq-eye' : 'i-jq-eye-closed'" />
      </div>
    </div>

    <div
      v-if="error"
      :id="`${id}-error`"
      role="alert"
      class="text-red-600 dark:text-red-400 text-sm"
    >
      {{ error }}
    </div>
  </div>
</template>
