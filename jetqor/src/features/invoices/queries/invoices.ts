import type { Invoice, InvoiceStatus, InvoiceType } from "../types";
import { defineQuery, useQuery } from "@pinia/colada";
import { computed } from "vue";
import { useRoute } from "vue-router";
import api from "~/plugins/api";

interface ApiInvoice {
  id: number;
  created_at: string;
  updated_at: string;
  status: InvoiceStatus;
  type: InvoiceType;
  ownerId: number;
  storageId: number;
}

function mapInvoice(invoice: ApiInvoice): Invoice {
  return {
    id: invoice.id.toString(),
    type: invoice.type,
    status: invoice.status,
    items: 0,
    warehouse: `Склад ${invoice.storageId}`,
    createdAt: new Date(invoice.created_at).toLocaleDateString(),
    city: "Алматы",
    client: `Клиент ${invoice.ownerId}`,
    responsible: "",
    owner: invoice.owner,
    storage: invoice.storage,
  };
}

async function getInvoices() {
  const response = await api<ApiInvoice[]>("/invoice", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.map(mapInvoice);
}

export const useInvoicesQuery = defineQuery(() => {
  const query = useQuery({
    key: () => ["invoices"],
    query: () => getInvoices(),
    staleTime: 30 * 1000,
  });

  return {
    ...query,
  };
});

async function getInvoice(id: string | null) {
  if (!id)
    return null;

  const response = await api<ApiInvoice>(`/invoice/id/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return mapInvoice(response);
}

export const useInvoiceQuery = defineQuery(() => {
  const route = useRoute();
  const selectedId = ref(route.params.id as string || "");
  watch(() => route.params.id, (newId) => {
    selectedId.value = newId as string || "";
    console.log("Selected ID:", selectedId.value);
  });
  const enabled = computed(() => selectedId.value !== "");
  const query = useQuery({
    key: () => ["invoice", selectedId.value],
    query: () => getInvoice(selectedId.value),
    staleTime: 30 * 1000,
    enabled,
  });
  return {
    ...query,
  };
});
