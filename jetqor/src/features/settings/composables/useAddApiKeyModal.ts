import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddApiKeyModal from "../components/modals/AddApiKeyModal.vue";

export type UpdateCallback = () => void;

const modalInstance = ref<any>(null);

export function useAddApiKeyModal() {
  function openModal(onUpdate?: UpdateCallback) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddApiKeyModal,
        attrs: {
          onClose() {
            closeModal();
          },
          onSuccess() {
            if (onUpdate)
              onUpdate();
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
