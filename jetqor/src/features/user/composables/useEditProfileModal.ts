import type { User } from "~/types";
import { ref } from "vue";
import { useModal } from "vue-final-modal";
import EditProfileModal from "../components/EditProfileModal.vue";
import { getUser } from "../queries/user";

export function useEditProfileModal() {
  const modalInstance = ref<any>(null);
  const { refetch } = getUser();

  function openModal(user: User) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: EditProfileModal,
        attrs: {
          user,
          onClose() {
            closeModal();
          },
          async onUpdated() {
            // Refresh user data after update
            await refetch();
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
