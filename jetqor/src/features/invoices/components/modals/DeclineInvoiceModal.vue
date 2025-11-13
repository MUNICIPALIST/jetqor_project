<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import useToasters from "~/composables/useToasters";
import { useInvoiceQuery } from "../../queries/invoices";
import { invoiceService } from "../../services/invoiceService";

const props = defineProps<{
  invoiceId: string | number;
}>();

const emit = defineEmits(["close", "success"]);

const { refetch } = useInvoiceQuery();
const { success, error } = useToasters();

const isLoading = ref(false);
const isSubmitted = ref(false);
const reason = ref("");

async function handleConfirm() {
  isSubmitted.value = true;

  if (!reason.value.trim()) {
    return;
  }

  try {
    isLoading.value = true;
    await invoiceService.declineInvoice(props.invoiceId, reason.value);

    // Обновляем данные о накладной
    await refetch();

    // Показываем сообщение об успехе
    success("Накладная успешно отклонена");

    // Уведомляем родителя об успешном отклонении
    emit("success");
  }
  catch (err) {
    console.error("Error declining invoice:", err);
    error("Ошибка при отклонении накладной");
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="max-w-md w-full flex flex-col m-4 rounded-lg bg-white p-6"
    overlay-class="bg-black/40"
    :click-to-close="false"
  >
    <header class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        Отклонение накладной
      </h2>
      <button class="p-1" @click="emit('close')">
        <span class="i-jq-close h-4 w-4" />
      </button>
    </header>

    <div class="mb-6">
      <label class="mb-2 block text-sm font-medium">
        Причина отклонения
      </label>
      <textarea
        v-model="reason"
        class="h-32 w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-main"
        placeholder="Укажите причину отклонения накладной"
        :class="{ 'border-red-500': isSubmitted && !reason.trim() }"
      />
      <p v-if="isSubmitted && !reason.trim()" class="text-red-500 mt-1 text-xs">
        Пожалуйста, укажите причину отклонения
      </p>
    </div>

    <div class="flex justify-end gap-4">
      <BaseButton variant="secondary" @click="emit('close')">
        Отмена
      </BaseButton>
      <BaseButton
        variant="error"
        :loading="isLoading"
        @click="handleConfirm"
      >
        Отклонить накладную
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
