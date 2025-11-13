import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddUserModal from "../components/modals/AddUserModal.vue";

const modalInstance = ref<any>(null);

export function useAddUserModal() {
  function openModal() {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddUserModal,
        attrs: {
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
