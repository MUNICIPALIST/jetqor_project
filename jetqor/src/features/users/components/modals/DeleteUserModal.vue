<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { VueFinalModal } from "vue-final-modal";

interface Props {
  userName: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative flex flex-col max-w-md w-full mx-4 p-6 bg-white rounded-lg"
    overlay-class="bg-black/40"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
    :click-to-close="false"
  >
    <div class="flex flex-col items-center text-center">
      <div class="mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-[#FF6E4E]/10">
        <span class="i-jq-close h-8 w-8 text-[#FF6E4E]" />
      </div>

      <h3 class="text-xl font-bold">
        Удалить пользователя
      </h3>

      <p class="mt-2 text-[#ABACAE]">
        Вы действительно хотите удалить пользователя {{ userName }}? Это действие нельзя будет отменить.
      </p>

      <div class="mt-6 w-full flex gap-4">
        <BaseButton
          variant="secondary"
          class="flex-1"
          @click="emit('close')"
        >
          Отмена
        </BaseButton>

        <BaseButton
          variant="error-outline"
          class="flex-1"
          @click="emit('confirm')"
        >
          Удалить
        </BaseButton>
      </div>
    </div>
  </VueFinalModal>
</template>
