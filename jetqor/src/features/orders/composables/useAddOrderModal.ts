import { ref } from "vue";
import { useModal } from "vue-final-modal";
import AddOrderModal from "../components/modals/AddOrderModal.vue";

const modalInstance = ref<any>(null);

export function useAddOrderModal() {
  function openModal() {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: AddOrderModal,
        attrs: {
          onClose() {
            closeModal();
          },
          onCreated() {
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
