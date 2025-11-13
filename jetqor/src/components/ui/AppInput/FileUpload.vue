<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  label?: string;
  error?: string;
  optional?: boolean;
  accept?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: File | null];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);

const displayName = computed(() => {
  if (!selectedFile.value)
    return "";
  return selectedFile.value.name;
});

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    emit("update:modelValue", input.files[0]);
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;

  if (e.dataTransfer?.files.length) {
    selectedFile.value = e.dataTransfer.files[0];
    emit("update:modelValue", e.dataTransfer.files[0]);
  }
}

function clearFile() {
  selectedFile.value = null;
  emit("update:modelValue", null);
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function handleClick() {
  fileInput.value?.click();
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm text-black fw-600">
      {{ label }}
      <span v-if="optional" class="text-grey">(необязательно)</span>
    </label>

    <div
      class="relative flex flex-col items-center justify-center border-2 rounded-2 border-dashed p-6 transition-colors hover:border-main"
      :class="{
        'border-main bg-main/5': isDragging,
        'border-red': error,
        'border-grayscale-200': !error && !isDragging,
      }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="handleClick"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept || 'image/*'"
        class="hidden"
        @change="handleFileChange"
      >

      <template v-if="selectedFile">
        <div class="flex items-center gap-2">
          <div class="i-jq-document text-4 text-grey" />
          <span class="text-sm fw-600">{{ displayName }}</span>
          <button
            class="ml-2 text-red hover:text-red/80"
            @click.stop="clearFile"
          >
            <div class="i-jq-close text-4" />
          </button>
        </div>
      </template>
      <template v-else>
        <div class="i-jq-download mb-2 text-8 text-grey" />
        <div class="text-center text-sm text-grey">
          <span class="text-main">Выберите файл</span> или перетащите его сюда
        </div>
      </template>
    </div>

    <p v-if="error" class="text-sm text-red">
      {{ error }}
    </p>
  </div>
</template>
