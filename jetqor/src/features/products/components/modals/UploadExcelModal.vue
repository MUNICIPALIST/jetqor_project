<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import FileUpload from "@/components/ui/AppInput/FileUpload.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { uploadExcelFile } from "../../services/productUploadService";
import { useProductsStore } from "../../store/product";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "uploaded"): void;
}>();

const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadError = ref("");

const productStore = useProductsStore();

function handleFileSelect(file: File | null) {
  selectedFile.value = file;
  uploadError.value = "";
}

async function handleUpload() {
  if (!selectedFile.value) {
    uploadError.value = "Выберите файл для загрузки";
    return;
  }

  // Проверяем расширение файла
  const fileName = selectedFile.value.name.toLowerCase();
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    uploadError.value = "Поддерживаются только Excel файлы (.xlsx, .xls)";
    return;
  }

  isUploading.value = true;
  uploadError.value = "";

  try {
    await uploadExcelFile(selectedFile.value);
    
    // Обновляем список товаров после успешной загрузки
    await productStore.refetchProducts();
    
    // Показываем успешное сообщение
    useToasters().success("Файл успешно загружен");
    
    emit("uploaded");
  } catch (error) {
    console.error("Upload error:", error);
    uploadError.value = error instanceof Error ? error.message : "Произошла ошибка при загрузке файла";
  } finally {
    isUploading.value = false;
  }
}

function handleClose() {
  if (!isUploading.value) {
    emit("close");
  }
}
</script>

<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col mx-4 p-4 bg-white border border-gray-300 rounded-lg space-y-4"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Загрузить товары из Excel</h2>
      <button
        :disabled="isUploading"
        class="text-gray-500 hover:text-gray-700 disabled:opacity-50"
        @click="handleClose"
      >
        <span class="i-jq-close h-6 w-6" />
      </button>
    </div>

    <div class="w-full max-w-md">
      <FileUpload
        v-model="selectedFile"
        label="Excel файл"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        :error="uploadError"
        @update:model-value="handleFileSelect"
      />
    </div>

    <div class="text-sm text-gray-600">
      <p>Поддерживаемые форматы: .xlsx, .xls</p>
      <p>Максимальный размер файла: 10 МБ</p>
    </div>

    <div class="flex gap-2 justify-end">
      <BaseButton
        variant="secondary"
        :disabled="isUploading"
        @click="handleClose"
      >
        Отмена
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!selectedFile || isUploading"
        @click="handleUpload"
      >
        <span v-if="isUploading" class="i-jq-loader animate-spin h-4 w-4 mr-2" />
        {{ isUploading ? "Загружается..." : "Загрузить" }}
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
