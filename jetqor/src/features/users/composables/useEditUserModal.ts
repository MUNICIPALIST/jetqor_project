import type { User } from "../types";
import { ref } from "vue";
import { useModal } from "vue-final-modal";
import EditUserModal from "../components/modals/EditUserModal.vue";

export function useEditUserModal() {
  const modalInstance = ref<any>(null);

  function openModal(user: User) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: EditUserModal,
        attrs: {
          user,
          onClose() {
            closeModal();
          },
          onUpdated() {
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
