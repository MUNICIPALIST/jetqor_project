<script setup lang="ts">
import type { Product } from "../types";
import { numberFormat } from "@/utils/number";
import useUser from "~/features/user/composables/useUser";
import { useEditProductModal } from "../composables/useEditProductModal";

const props = defineProps<{
  product: Product;
}>();

const { isManager } = useUser();

const { openModal } = useEditProductModal();

function handleEdit() {
  openModal(props.product);
}

const isImageError = ref(false);
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <div class="flex gap-6">
      <!-- Product Image -->
      <div class="h-32 w-32 flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        <img
          v-if="product.photo_url && !isImageError"
          :src="product.photo_url"
          :alt="product.name"
          class="h-full w-full object-cover"
          @error="isImageError = true"
        >
        <div v-else class="flex items-center justify-center rounded-4 bg-gray-100 object-cover">
          <div class="i-jq-bag text-10 text-[#EA6001]" />
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex flex-1 flex-col">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">
              {{ product.name }}
            </h1>
            <p class="text-gray-500">
              Артикул: {{ product.article }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-lg text-main font-medium">
              {{ numberFormat(product.price) }} KZT
            </div>
            <BaseButton v-if="!isManager" variant="secondary" @click="handleEdit">
              <div class="i-jq-edit-filled mr-2 h-5 w-5" />
              Редактировать
            </BaseButton>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <!-- Rating Badge -->
          <span class="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm text-yellow-500">
            <span class="i-jq-star h-4 w-4" />
            4.8
          </span>

          <!-- Sales Label -->
          <span class="rounded bg-[#4AAF571A] px-2 py-1 text-sm text-[#4AAF57]">
            Высокий спрос
          </span>

          <!-- Marketplace Integrations -->
          <div class="flex gap-2">
            <img
              v-if="product.integration_kaspi"
              src="/platforms/kaspi.svg"
              alt="Kaspi"
              class="h-6 w-6"
            >
            <img
              v-if="product.integration_wildberries"
              src="/platforms/wildberries.svg"
              alt="Wildberries"
              class="h-6 w-6"
            >
            <img
              v-if="product.integration_ozon"
              src="/platforms/ozon.svg"
              alt="Ozon"
              class="h-6 w-6"
            >
          </div>
        </div>

        <!-- Product Description -->
        <p v-if="product.description" class="mt-4 text-gray-600">
          {{ product.description }}
        </p>

        <!-- Product Dimensions -->
        <div v-if="product.volume || product.weight" class="mt-4 flex flex-wrap gap-3">
          <span v-if="product.volume" class="flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-sm">
            <span class="i-jq-card-box-filled h-4 w-4" />
            Объем: {{ product.volume }} м³
          </span>
          <span v-if="product.weight" class="flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-sm">
            <span class="i-jq-activity h-4 w-4" />
            Вес: {{ product.weight }} кг
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
