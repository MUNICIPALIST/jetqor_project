import { ref } from "vue";
import { useModal } from "vue-final-modal";
import CreateProductModal from "../components/modals/CreateProductModal.vue";
import { useProductsStore } from "../store/product";

export function useCreateProductModal() {
  const modalInstance = ref<any>(null);
  const store = useProductsStore();
  function openModal() {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: CreateProductModal,
        attrs: {
          onClose() {
            closeModal();
          },
          onCreated() {
            // get products list
            store.refetchProducts();
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
