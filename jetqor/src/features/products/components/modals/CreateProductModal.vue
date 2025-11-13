<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import api from "~/plugins/api";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
}>();

const formData = ref({
  name: "",
  article: "",
  description: "",
  photo_url: "",
  width: "",
  height: "",
  length: "",
  volume: "",
  weight: "",
  price: "",
  image: null as File | null,
});

const errors = ref({
  name: "",
  article: "",
  description: "",
  photo_url: "",
  width: "",
  height: "",
  length: "",
  volume: "",
  weight: "",
  price: "",
  image: "",
});

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    formData.value.image = input.files[0];
  }
}

function calculateVolume() {
  const width = Number(formData.value.width) || 0;
  const height = Number(formData.value.height) || 0;
  const length = Number(formData.value.length) || 0;
  formData.value.volume = String(width * height * length);
}

async function handleSubmit() {
  // Reset errors
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  // Validate
  let hasError = false;
  if (!formData.value.name) {
    errors.value.name = "Введите название товара";
    hasError = true;
  }
  if (!formData.value.article) {
    errors.value.article = "Введите артикул";
    hasError = true;
  }
  if (!formData.value.weight || Number(formData.value.weight) <= 0) {
    errors.value.weight = "Введите корректный вес";
    hasError = true;
  }
  if (!formData.value.width || Number(formData.value.width) <= 0) {
    errors.value.width = "Введите корректную ширину";
    hasError = true;
  }
  if (!formData.value.length || Number(formData.value.length) <= 0) {
    errors.value.length = "Введите корректную длину";
    hasError = true;
  }
  if (!formData.value.height || Number(formData.value.height) <= 0) {
    errors.value.height = "Введите корректную высоту";
    hasError = true;
  }
  if (!formData.value.price || Number(formData.value.price) <= 0) {
    errors.value.price = "Введите корректную цену";
    hasError = true;
  }

  if (hasError)
    return;

  try {
    calculateVolume();

    const response = await api("/product/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        name: formData.value.name,
        article: formData.value.article,
        description: formData.value.description,
        photo_url: formData.value.photo_url || "https://example.com/image.jpg",
        width: formData.value.width,
        height: formData.value.height,
        length: formData.value.length,
        weight: formData.value.weight,
        price: formData.value.price,
      },
    });

    if (response) {
      emit("created");
      emit("close");
    }
  }
  catch (error) {
    console.error("Error creating product:", error);
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative max-w-lg w-full rounded-lg bg-white p-6"
    overlay-class="bg-black/40"
  >
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-semibold">
        Создание нового товара
      </h2>
      <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Название -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Название</label>
        <input
          v-model="formData.name"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.name }"
        >
        <p v-if="errors.name" class="text-red-500 mt-1 text-sm">
          {{ errors.name }}
        </p>
      </div>

      <!-- Артикул -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Артикул</label>
        <input
          v-model="formData.article"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.article }"
        >
        <p v-if="errors.article" class="text-red-500 mt-1 text-sm">
          {{ errors.article }}
        </p>
      </div>

      <!-- Описание -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Описание</label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.description }"
        />
        <p v-if="errors.description" class="text-red-500 mt-1 text-sm">
          {{ errors.description }}
        </p>
      </div>

      <!-- Вес -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Вес (в граммах)</label>
        <input
          v-model="formData.weight"
          type="number"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.weight }"
        >
        <p v-if="errors.weight" class="text-red-500 mt-1 text-sm">
          {{ errors.weight }}
        </p>
      </div>

      <!-- Размеры -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="mb-1 block text-sm text-gray-700 font-medium">Ширина (см)</label>
          <input
            v-model="formData.width"
            type="number"
            class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            :class="{ 'border-red-500': errors.width }"
            @input="calculateVolume"
          >
          <p v-if="errors.width" class="text-red-500 mt-1 text-sm">
            {{ errors.width }}
          </p>
        </div>
        <div>
          <label class="mb-1 block text-sm text-gray-700 font-medium">Длина (см)</label>
          <input
            v-model="formData.length"
            type="number"
            class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            :class="{ 'border-red-500': errors.length }"
            @input="calculateVolume"
          >
          <p v-if="errors.length" class="text-red-500 mt-1 text-sm">
            {{ errors.length }}
          </p>
        </div>
        <div>
          <label class="mb-1 block text-sm text-gray-700 font-medium">Высота (см)</label>
          <input
            v-model="formData.height"
            type="number"
            class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
            :class="{ 'border-red-500': errors.height }"
            @input="calculateVolume"
          >
          <p v-if="errors.height" class="text-red-500 mt-1 text-sm">
            {{ errors.height }}
          </p>
        </div>
      </div>

      <!-- Объем (вычисляется автоматически) -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Объем (см³)</label>
        <input
          v-model="formData.volume"
          type="number"
          disabled
          class="w-full border border-gray-200 rounded-md bg-gray-50 px-3 py-2"
        >
      </div>

      <!-- Цена -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">Цена (тг)</label>
        <input
          v-model="formData.price"
          type="number"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          :class="{ 'border-red-500': errors.price }"
        >
        <p v-if="errors.price" class="text-red-500 mt-1 text-sm">
          {{ errors.price }}
        </p>
      </div>

      <!-- URL изображения -->
      <div>
        <label class="mb-1 block text-sm text-gray-700 font-medium">URL изображения</label>
        <input
          v-model="formData.photo_url"
          type="text"
          class="focus:border-blue-500 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
          placeholder="https://example.com/image.jpg"
        >
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <BaseButton variant="secondary" @click="emit('close')">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" type="submit">
          Создать товар
        </BaseButton>
      </div>
    </form>
  </VueFinalModal>
</template>
