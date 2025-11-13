import { ref } from "vue";
import { useModal } from "vue-final-modal";
import OrderAssemblyModal from "../components/modals/OrderAssemblyModal.vue";
import OrderAssemblyModalContent from "../components/modals/OrderAssemblyModalContent.vue";

// Create a singleton instance that can be shared across components
const modalInstance = ref<any>(null);

export function useOrderAssemblyModal() {
  // Function to open the modal
  function openModal(orderId: string | number) {
    console.log("Opening modal for order:", orderId);

    if (!orderId) {
      console.error("Order ID is required to open the modal");
      return;
    }

    // Only create a new modal instance if one doesn't already exist
    if (!modalInstance.value) {
      console.log("Creating new modal instance");
      modalInstance.value = useModal({
        component: OrderAssemblyModal,
        attrs: {
          title: "Сборка заказа",
          id: String(orderId), // Ensure ID is always passed as string
          onClose() {
            console.log("Modal onClose triggered");
            closeModal();
          },
          onSave() {
            console.log("Modal onSave triggered");
            closeModal();
          },
        },
        slots: {
          default: OrderAssemblyModalContent,
        },
      });
    }

    modalInstance.value.open();
    console.log("Modal opened");
  }

  // Function to close the modal
  function closeModal() {
    console.log("Closing modal");
    if (modalInstance.value) {
      modalInstance.value.close();
      modalInstance.value = null;
      console.log("Modal closed and instance cleared");
    }
  }

  return {
    openModal,
    closeModal,
  };
}
