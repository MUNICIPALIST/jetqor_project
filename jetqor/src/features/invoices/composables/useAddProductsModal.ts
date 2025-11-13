import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddProductsModal from "../components/modals/AddProductsModal.vue";
import AddProductsModalContent from "../components/modals/AddProductsModalContent.vue";

// Create a singleton instance that can be shared across components
const modalInstance = ref<any>(null);

export function useAddProductsModal() {
  // Function to open the modal
  function openModal(invoiceId: string | number) {
    if (!invoiceId) {
      console.error('Invoice ID is required to open the modal');
      return;
    }

    // Only create a new modal instance if one doesn't already exist
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddProductsModal,
        attrs: {
          title: "Разобрать товары",
          id: String(invoiceId), // Ensure ID is always passed as string
          onClose() {
            closeModal();
          },
          onSave() {
            closeModal();
          },
        },
        slots: {
          default: AddProductsModalContent,
        },
      });
    }

    modalInstance.value.open();
  }

  // Function to close the modal
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
