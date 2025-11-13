import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddWarehouseModal from "../components/modals/AddWarehouseModal.vue";
import AddWarehouseModalContent from "../components/modals/AddWarehouseModalContent.vue";
import { useWarehousesStore } from "../store/warehouses";

// Use a separate instance of the modal for each opening to avoid stale state
const modalInstance = ref<any>(null);

export function useAddWarehouseModal() {
  const warehousesStore = useWarehousesStore();

  function openModal() {
    // Always create a new modal instance
    console.warn("Opening warehouse modal, creating new instance");
    modalInstance.value = useModal({
      component: AddWarehouseModal,
      attrs: {
        onClose: () => {
          console.warn("Modal close event received");
          closeModal();
        },
        onSuccess: async () => {
          // When we get success, refresh the warehouses list
          console.warn("Modal success event received, refreshing warehouses");
          try {
            await warehousesStore.refreshWarehouses();
            console.warn("Warehouses refreshed after modal success");
            modalInstance.value.close();
          }
          catch (e) {
            console.error("Error refreshing warehouses after success:", e);
          }
        },
      },
      slots: {
        default: AddWarehouseModalContent,
      },
    });

    modalInstance.value.open();
  }

  function closeModal() {
    if (modalInstance.value) {
      console.warn("Closing modal instance");
      modalInstance.value.close();
      // Always reset the modal instance to null to ensure a fresh one is created next time
      setTimeout(() => {
        modalInstance.value = null;
        console.warn("Modal instance cleared after timeout");
      }, 300); // Wait for animation to complete
    }
  }

  return {
    openModal,
    closeModal,
  };
}
