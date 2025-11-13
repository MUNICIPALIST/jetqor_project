<script setup lang="ts">
import MeasuredInput from "@/components/ui/AppInput/MeasuredInput.vue";
import api from "@/plugins/api";
import { ref } from "vue";

const emit = defineEmits<{
  created: [];
}>();

const formData = ref({
  name: "",
  article: "",
  photo_url: "",
  description: "",
  price: "",
  width: "",
  height: "",
  length: "",
  volume: "",
  weight: "",
});

const errors = ref({
  name: "",
  article: "",
  photo_url: "",
  description: "",
  price: "",
  width: "",
  height: "",
  length: "",
  volume: "",
  weight: "",
});

async function submit() {
  // Reset errors
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  // Validate
  let hasError = false;
  if (!formData.value.name || formData.value.name.length < 2) {
    errors.value.name = "Название товара должно содержать минимум 2 символа";
    hasError = true;
  }
  if (!formData.value.article) {
    errors.value.article = "Введите артикул";
    hasError = true;
  }
  if (!formData.value.photo_url) {
    errors.value.photo_url = "Введите URL фотографии";
    hasError = true;
  }
  if (!formData.value.description) {
    errors.value.description = "Введите описание";
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
  if (!formData.value.volume || Number(formData.value.volume) <= 0) {
    errors.value.volume = "Введите корректный объем";
    hasError = true;
  }
  if (!formData.value.price || Number(formData.value.price) <= 0) {
    errors.value.price = "Введите корректную цену";
    hasError = true;
  }

  if (hasError)
    return false;

  try {
    await api("/product/create", {
      method: "POST",
      body: JSON.stringify(formData.value),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    emit("created");
    return true;
  }
  catch (error) {
    console.error("Error creating product:", error);
    return false;
  }
}

defineExpose({
  submit,
});
</script>

<template>
  <form class="flex flex-col gap-6">
    <div class="text-h5 fw-700">
      Основная информация
    </div>

    <div class="flex flex-col gap-6">
      <!-- Основная информация -->
      <div class="grid grid-cols-2 gap-5">
        <MeasuredInput
          v-model="formData.name"
          label="Название товара"
          placeholder="Введите название"
          :error="errors.name"
        />
        <MeasuredInput
          v-model="formData.article"
          label="Артикул"
          placeholder="Введите артикул"
          :error="errors.article"
        />
        <MeasuredInput
          v-model="formData.photo_url"
          label="URL фотографии"
          placeholder="Введите URL"
          :error="errors.photo_url"
        />
        <MeasuredInput
          v-model="formData.description"
          label="Описание"
          placeholder="Введите описание"
          :error="errors.description"
        />
      </div>

      <!-- Размеры -->
      <div>
        <div class="mb-4 text-4 text-grey fw-600">
          Размеры
        </div>

        <div class="grid grid-cols-3 gap-5">
          <MeasuredInput
            v-model="formData.width"
            type="number"
            label="Ширина"
            placeholder="0"
            unit="см"
            :error="errors.width"
          />
          <MeasuredInput
            v-model="formData.length"
            type="number"
            label="Длина"
            placeholder="0"
            unit="см"
            :error="errors.length"
          />
          <MeasuredInput
            v-model="formData.height"
            type="number"
            label="Высота"
            placeholder="0"
            unit="см"
            :error="errors.height"
          />
          <MeasuredInput
            v-model="formData.volume"
            type="number"
            label="Объем"
            placeholder="0"
            unit="см³"
            :error="errors.volume"
          />
        </div>
      </div>

      <!-- Цена и вес -->
      <div>
        <div class="mb-4 text-h5 fw-700">
          Цена и вес
        </div>

        <div class="grid grid-cols-2 gap-5">
          <MeasuredInput
            v-model="formData.price"
            type="number"
            label="Цена"
            placeholder="0"
            unit="тг"
            :error="errors.price"
          />
          <MeasuredInput
            v-model="formData.weight"
            type="number"
            label="Вес"
            placeholder="0"
            unit="г"
            :error="errors.weight"
          />
        </div>
      </div>
    </div>
  </form>
</template>
