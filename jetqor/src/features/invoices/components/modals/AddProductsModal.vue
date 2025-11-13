<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { useWarehousesStore } from "~/features/warehouses/store/warehouses";
import { useInvoiceQuery } from "../../queries/invoices";
import { invoiceService } from "../../services/invoiceService";
import { useProductDistributionStore } from "../../store/productDistribution";

const props = defineProps<{
  title?: string;
  id: string; // Make id required and expect it as string
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const productDistributionStore = useProductDistributionStore();
const warehousesStore = useWarehousesStore();
const showProductList = ref(false);
const isLoading = ref(false);
const showSuccessMessage = ref(false);

// Function to get product details from the store - now using the correct id
function getProductDetails(id: number) {
  return productDistributionStore.invoiceProducts.find(p => p.id === id);
}

function handleContinue() {
  if (productDistributionStore.isAllProductsDistributed) {
    showProductList.value = true;
  }
}

async function handleConfirm() {
  if (isLoading.value)
    return;

  // Collect distributed products for the API
  const products = productDistributionStore.distributedProducts.map(product => ({
    product_id: product.product_id,
    cell_id: product.cell_id,
    count: product.count,
  }));

  try {
    isLoading.value = true;

    // Use the invoice ID from props directly
    await invoiceService.approveProductDistribution(props.id, products);

    // Show success message
    showSuccessMessage.value = true;

    // Refresh warehouse data to show updated inventory
    warehousesStore.refreshWarehouses();

    useInvoiceQuery().refetch();

    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccessMessage.value = false;
      // Emit save event after successful request
      emit("save");
    }, 3000);
  }
  catch (error) {
    console.error("Error approving invoice:", error);
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <VueFinalModal
    class="fixed inset-0"
    content-class="w-[1100px] absolute right-0 top-0 h-full flex flex-col bg-grayscale-100 rounded-l-8 p-8"
    overlay-class="bg-black/40"
    content-transition="vfm-slide-right"
    overlay-transition="vfm-fade"
    :hide-overlay="false"
  >
    <!-- Header with title and close button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <button
          class="size-11 flex items-center justify-center rounded-full bg-white p-2.5 transition-all active:scale-90 hover:scale-105"
          @click="emit('close')"
        >
          <div class="i-jq-close h-4 w-4 text-black" />
        </button>
        <div class="text-2xl font-bold">
          {{ showProductList ? 'Подтверждение распределения' : title }}
        </div>
      </div>

      <!-- Continue/Confirm button with clear status indicator -->
      <BaseButton
        variant="primary"
        class="px-6 py-3 text-base font-medium"
        :class="{
          'bg-main hover:bg-main-darker': productDistributionStore.isAllProductsDistributed,
          'bg-gray-400 cursor-not-allowed': !productDistributionStore.isAllProductsDistributed,
        }"
        :loading="isLoading"
        :disabled="!productDistributionStore.isAllProductsDistributed || isLoading"
        @click="showProductList ? handleConfirm() : handleContinue()"
      >
        <template v-if="isLoading">
          Обработка...
        </template>
        <template v-else-if="showProductList">
          Подтвердить
        </template>
        <template v-else>
          <template v-if="productDistributionStore.isAllProductsDistributed">
            Продолжить
          </template>
          <template v-else>
            Распределите все товары ({{ productDistributionStore.fullyDistributedProductsCount }}/{{ productDistributionStore.invoiceProducts.length }})
          </template>
        </template>
      </BaseButton>
    </div>

    <div class="my-6 h-px w-full bg-grayscale-200" />

    <!-- Main content -->
    <div class="flex-1 overflow-y-auto">
      <template v-if="showProductList">
        <!-- Display the list of added products -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold">
            Прикрепленные товары
          </h2>
          <div v-for="product in productDistributionStore.distributedProducts" :key="`${product.product_id}-${product.cell_id}`" class="border border-grayscale-200 rounded-2xl bg-white p-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-md bg-grayscale-100" />
                <div class="space-y-1">
                  <div class="text-sm font-semibold">
                    {{ getProductDetails(product.product_id)?.name }}
                  </div>
                  <div class="text-sm text-grey">
                    {{ getProductDetails(product.product_id)?.article }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-grey">
                {{ product.count }} шт.
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <div class="flex items-center gap-2 rounded bg-grayscale-100 px-2 py-1.5">
                <span class="i-jq-document h-4 w-4" />
                <span class="text-xs font-medium">Артикул: {{ getProductDetails(product.product_id)?.article }}</span>
              </div>
              <div class="flex items-center gap-2 rounded bg-grayscale-100 px-2 py-1.5">
                <span class="i-jq-location h-4 w-4" />
                <span class="text-xs font-medium">Код ячейки: {{ product.cell_code }}</span>
              </div>
              <div class="flex items-center gap-2 rounded bg-grayscale-100 px-2 py-1.5">
                <span class="i-jq-category h-4 w-4" />
                <span class="text-xs font-medium">Название ячейки: {{ product.cell_name }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <slot />
      </template>
    </div>

    <!-- Fixed footer with Continue button for better visibility -->
    <!-- <div v-if="!showProductList && !productDistributionStore.isAllProductsDistributed" class="sticky bottom-0 left-0 right-0 mt-6 border-t border-grayscale-200 bg-grayscale-100 pt-4">
      <div class="flex justify-end">
        <BaseButton
          variant="primary"
          class="px-6 py-3 text-base font-medium"
          :class="{
            'bg-main hover:bg-main-darker': productDistributionStore.isAllProductsDistributed,
            'bg-gray-400 cursor-not-allowed': !productDistributionStore.isAllProductsDistributed,
          }"
          :disabled="!productDistributionStore.isAllProductsDistributed"
          @click="handleContinue"
        >
          Распределите все товары ({{ productDistributionStore.fullyDistributedProductsCount }}/{{ productDistributionStore.invoiceProducts.length }})
        </BaseButton>
      </div>
    </div> -->
  </VueFinalModal>
</template>
