<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { VueFinalModal } from "vue-final-modal";

const emit = defineEmits<{
  (e: "close"): void;
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
      <div class="mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-[#77BD8B]/10">
        <span class="i-jq-tick h-8 w-8 text-[#77BD8B]" />
      </div>

      <h3 class="text-xl font-bold">
        Пользователь создан
      </h3>

      <p class="mt-2 text-[#ABACAE]">
        Пользователь успешно создан и добавлен в систему
      </p>

      <BaseButton
        variant="primary"
        class="mt-6"
        @click="emit('close')"
      >
        Готово
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
