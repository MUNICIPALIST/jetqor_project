import { ref } from "vue";
import { useModal } from "vue-final-modal";
import EditWarehouseModal from "../components/modals/EditWarehouseModal.vue";
import EditWarehouseModalContent from "../components/modals/EditWarehouseModalContent.vue";

const modalInstance = ref<any>(null);

export function useEditWarehouseModal() {
  function openModal() {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: EditWarehouseModal,
        attrs: {
          onClose: () => {
            closeModal();
          },
          onUpdated: () => {
            // The store is updated directly in the modal content component
            // so we don't need to do anything here
            closeModal();
          },
        },
        slots: {
          default: EditWarehouseModalContent,
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
