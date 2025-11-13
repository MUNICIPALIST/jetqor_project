import { ref } from "vue";
import { useModal } from "vue-final-modal";
import DeleteUserModal from "../components/modals/DeleteUserModal.vue";

const modalInstance = ref<any>(null);

export function useDeleteUserModal() {
  function openModal(userName: string, onConfirm: () => void) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: DeleteUserModal,
        attrs: {
          userName,
          onClose() {
            closeModal();
          },
          async onConfirm() {
            await onConfirm();
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
