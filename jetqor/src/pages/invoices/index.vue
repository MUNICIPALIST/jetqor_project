<script setup lang="ts">
import InvoiceFilters from "@/components/invoices/InvoiceFilters.vue";
import InvoiceItem from "@/features/invoices/components/InvoiceItem.vue";
import { useInvoicesQuery } from "@/features/invoices/queries/invoices";
import { useAddClientInvoiceModal } from "~/features/invoices/composables/useAddClientInvoiceModal";

const { data: invoices, isLoading } = useInvoicesQuery();

const { openModal: openInvoiceModal } = useAddClientInvoiceModal();

function handleCreateInvoice() {
  openInvoiceModal();
}

const type = ref("all");
const computedInvoicesByType = computed(() => {
  if (type.value === "all")
    return invoices.value;
  return invoices.value?.filter(invoice => invoice.type === type.value);
});
const status = ref("all");
const computedInvoicesByStatusAndType = computed(() => {
  return computedInvoicesByType.value?.filter((invoice) => {
    if (status.value === "all")
      return true;
    return invoice.status === status.value;
  });
});
</script>

<template>
  <div class="space-y-6">
    <BaseButton variant="primary" class="ml-auto" @click="handleCreateInvoice">
      <span class="i-jq-plus-filled h-4 w-4" />
      Создать накладную
    </BaseButton>

    <InvoiceFilters @update:type="type = $event" @update:status="status = $event" />
    <div v-if="isLoading" class="p-4 text-center">
      Загрузка...
    </div>
    <div v-else-if="!invoices?.length" class="p-4 text-center">
      Накладные не найдены
    </div>
    <div v-else class="space-y-3">
      <InvoiceItem
        v-for="invoice in computedInvoicesByStatusAndType"
        :key="invoice.id"
        :invoice="invoice"
      />
    </div>
  </div>
</template>
