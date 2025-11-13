import { ref } from "vue";
import { useModal } from "vue-final-modal";
import useToasters from "~/composables/useToasters";
import AddClientInvoiceModal from "../components/modals/AddClientInvoiceModal.vue";
import { useInvoicesQuery } from "../queries/invoices";

const modalInstance = ref<any>(null);

export function useAddClientInvoiceModal() {
  const { refetch: refetchInvoices } = useInvoicesQuery();
  const { success } = useToasters();

  function openModal() {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddClientInvoiceModal,
        attrs: {
          onClose() {
            closeModal();
          },
          onSuccess() {
            // Refresh the invoices list when the modal is closed after successful creation
            refetchInvoices();
            success("Накладная успешно создана");
            closeModal();
          },
        },
      });
    }

    modalInstance.value.open();
  }

  function closeModal() {
    if (modalInstance.value) {
      modalInstance.value.close();
      modalInstance.value = null;
    }
  }

  return {
    openModal,
    closeModal,
  };
}
