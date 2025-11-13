<script setup lang="ts">
defineProps<{
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  unit?: string;
  error?: string;
  type?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm text-black fw-600">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :value="modelValue"
        :type="type || 'text'"
        :placeholder="placeholder"
        class="w-full border border-grayscale-200 rounded-2 px-3 py-2 focus:border-main focus:outline-none"
        :class="{
          'border-red': error,
          'pr-12': unit, // Больше padding справа если есть единица измерения
        }"
        @input="handleInput"
      >
      <div
        v-if="unit"
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-grey"
      >
        {{ unit }}
      </div>
    </div>
    <p v-if="error" class="text-sm text-red">
      {{ error }}
    </p>
  </div>
</template>
