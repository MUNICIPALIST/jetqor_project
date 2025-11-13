import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddCellModal from "../components/modals/AddCellModal.vue";

const modalInstance = ref<any>(null);

export function useAddCellModal() {
  function openModal(rackId: number, rowId: number) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddCellModal,
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
