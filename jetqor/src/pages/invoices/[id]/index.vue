<script setup lang="ts">
import { computed, onUnmounted, watch } from "vue";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import InvoiceStatusProgress from "@/features/invoices/components/InvoiceStatusProgress.vue";
import { useAddProductsModal } from "@/features/invoices/composables/useAddProductsModal";
import { useDeclineInvoiceModal } from "@/features/invoices/composables/useDeclineInvoiceModal";
import { useInvoiceQuery } from "@/features/invoices/queries/invoices";
import { useDetailedProductsStore } from "@/features/invoices/store/detailedProducts";
import ProductCardDetailedInfoItem from "@/features/products/components/ProductCardDetailedInfoItem.vue";

const { data: invoice, isLoading } = useInvoiceQuery();
const { openModal } = useAddProductsModal();
const { openModal: openDeclineModal, isSuccess: isDeclineSuccess } = useDeclineInvoiceModal();
const detailedProductsStore = useDetailedProductsStore();

// Fetch detailed products when invoice loads
watch(() => invoice.value?.id, (newId) => {
  if (newId) {
    detailedProductsStore.fetchProducts(Number(newId));
  }
}, { immediate: true });

// Refresh when invoice is declined
watch(() => isDeclineSuccess.value, (isSuccess) => {
  if (isSuccess) {
    // Обновим данные на странице, чтобы отобразить новый статус
    window.location.reload();
  }
});

// Clean up when component unmounts
onUnmounted(() => {
  detailedProductsStore.clearProducts();
});

// Check if products should be displayed
const shouldShowProducts = computed(() => {
  return invoice.value?.status === "approved" && detailedProductsStore.products.length > 0;
});

function handleDownload() {
  console.warn("Downloading invoice...");
}

function handleCancel() {
  if (invoice?.value?.id) {
    openDeclineModal(invoice.value.id);
  }
}

function handleAddProducts() {
  if (invoice?.value?.id) {
    openModal(invoice.value.id);
  }
}

function handleChange() {
  console.warn("Changing invoice...");
}

function getInvoiceTypeLabel(type: string | undefined): string {
  switch (type) {
    case "incoming":
      return "Приходная";
    case "consumable":
      return "Расходная";
    case "internal":
      return "Внутренняя";
    case "return":
      return "Возвратная";
    default:
      return "Неизвестный тип";
  }
}

const invoiceStatus = computed(() => {
  switch (invoice.value?.status) {
    case "created":
      return "Созданный";
    case "approved":
      return "Одобренный";
    case "declined":
      return "Отклоненный";
    case "indelivery":
      return "В доставке";
    default:
      return invoice.value?.status || "Неизвестный статус";
  }
});

const invoiceType = computed(() => {
  return getInvoiceTypeLabel(invoice.value?.type);
});
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="rounded-xl bg-white p-6">
      <div v-if="isLoading" class="p-4 text-center">
        Загрузка...
      </div>
      <div v-else-if="!invoice" class="p-4 text-center">
        Накладная не найдена
      </div>
      <div v-else class="flex justify-between">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">
              № {{ invoice.id }}
            </h1>
            <div class="bg-green-50 rounded px-2.5 py-2 text-sm text-green font-medium">
              {{ getInvoiceTypeLabel(invoice.type) }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <BaseButton variant="error-outline" @click="handleCancel">
            Отменить
          </BaseButton>
          <BaseButton variant="primary" @click="handleDownload">
            <span class="i-jq-download h-4 w-4" />
            Скачать накладную
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Status -->
    <div class="rounded-xl bg-white p-5">
      <h2 class="mb-8 text-lg font-semibold">
        Статус накладной
      </h2>

      <InvoiceStatusProgress
        v-if="invoice"
        :status="invoice.status"
        :on-add-products="handleAddProducts"
        :on-change-status="handleChange"
      />
    </div>

    <!-- Products -->
    <div v-if="shouldShowProducts" class="rounded-xl bg-white p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Прикрепленные товары
        </h2>
        <button class="flex items-center gap-3 rounded-xl bg-[#EA60011A] px-4 py-2 text-orange">
          <span class="i-jq-edit h-4 w-4" />
          <span class="font-semibold">Редактировать</span>
        </button>
      </div>
      <div v-if="detailedProductsStore.isLoading" class="py-4 text-center">
        Загрузка товаров...
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="product in detailedProductsStore.products"
          :key="product.id"
          class="border border-grayscale-100 rounded-2xl bg-grayscale-50 p-5"
        >
          <div class="flex flex-col gap-2">
            <!-- Product Info -->
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-md bg-grayscale-100">
                <img v-if="product.photo_url" :src="product.photo_url" :alt="product.name" class="h-full w-full rounded-md object-cover">
              </div>
              <div class="space-y-3">
                <div class="text-sm font-semibold">
                  {{ product.name }}
                </div>
                <div class="text-sm font-medium">
                  {{ product.price }} KZT
                </div>
              </div>
            </div>
            <!-- Location & Count -->
            <div class="mt-2 flex flex-wrap gap-4">
              <div class="flex items-center gap-2 rounded bg-grayscale-100 px-2 py-1.5">
                <span class="i-jq-document h-4 w-4" />
                <span class="text-xs font-medium">Артикул: {{ product.article }}</span>
              </div>
              <div v-if="product.handled" class="flex items-center gap-2">
                <div class="rounded bg-white px-3 py-2 text-xs font-medium">
                  Склад А
                </div>
                <span class="i-jq-chevron-right h-4 w-4 text-grey" />
                <div class="rounded bg-white px-3 py-2 text-xs font-medium">
                  {{ product.handled }}
                </div>
              </div>
            </div>
            <div class="mt-4 border-t border-grayscale-200" />
            <div class="pt-4 text-sm font-semibold">
              Количество: {{ product.invoiceCount }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="rounded-xl bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          О накладной
        </h2>
        <button class="h-10 flex items-center border border-grayscale-100 rounded-[1111px] px-2.5 py-2">
          <span class="i-jq-chevron-up h-5 w-5" />
        </button>
      </div>

      <div v-if="invoice" class="grid grid-cols-2 gap-3">
        <ProductCardDetailedInfoItem title="Тип накладной" :value="invoiceType" />
        <ProductCardDetailedInfoItem v-if="invoice.products?.length" title="Кол-во товаров" :value="invoice.products.reduce((sum, p) => sum + p.count, 0)()" />
        <ProductCardDetailedInfoItem v-if="invoice?.storage" title="Город" :value="invoice.storage.city" />
        <ProductCardDetailedInfoItem v-if="invoice?.storage" title="Склад" :value="invoice.storage.name" />
        <ProductCardDetailedInfoItem v-if="invoice?.owner" title="Клиент" :value="invoice.owner.name" />
        <ProductCardDetailedInfoItem title="Ответственный" :value="invoice.responsible" />
        <ProductCardDetailedInfoItem title="Дата создания" :value="invoice.createdAt" />
        <ProductCardDetailedInfoItem title="Статус" :value="invoiceStatus" />
      </div>
    </div>

    <!-- Manager -->
    <div v-if="invoice" class="rounded-xl bg-white p-6">
      <h2 class="mb-3 text-lg font-bold">
        Менеджер
      </h2>
      <div class="rounded-xl bg-grayscale-100 p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="h-9 w-9 flex items-center justify-center rounded-lg bg-white font-bold">
              {{ invoice.responsible[0] }}
            </div>
            <div>
              <div class="text-lg font-semibold">
                {{ invoice.responsible }}
              </div>
              <div class="text-sm text-second font-medium">
                Менеджер
              </div>
            </div>
          </div>
          <button class="i-jq-chevron-right h-5 w-5" />
        </div>
      </div>
    </div>

    <!-- Client -->
    <div v-if="invoice" class="rounded-xl bg-white p-6">
      <h2 class="mb-3 text-lg font-bold">
        Клиент
      </h2>

      <div class="rounded-xl bg-grayscale-100 p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="h-9 w-9 flex items-center justify-center rounded-lg bg-white font-bold">
              {{ invoice.client[0] }}
            </div>
            <div>
              <div class="text-lg font-semibold">
                {{ invoice?.owner?.name }}
              </div>
              <div class="text-sm text-second font-medium">
                Клиент
              </div>
            </div>
          </div>
          <button class="i-jq-chevron-right h-5 w-5" />
        </div>
      </div>
    </div>
  </div>
</template>
