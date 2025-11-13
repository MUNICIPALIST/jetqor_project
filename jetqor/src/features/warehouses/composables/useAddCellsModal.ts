import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddCellsModal from "../components/modals/AddCellsModal.vue";

const modalInstance = ref<any>(null);

export function useAddCellsModal() {
  function openModal(rackId: number, rowId: number) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddCellsModal,
        attrs: {
          rackId,
          rowId,
          onClose() {
            closeModal();
          },
          onSuccess() {
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
