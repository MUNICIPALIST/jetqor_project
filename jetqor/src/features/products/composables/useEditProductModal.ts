import type { Product } from "../types";
import { ref } from "vue";
import { useModal } from "vue-final-modal";
import EditProductModal from "../components/modals/EditProductModal.vue";
import { useProductQuery } from "../queries/products";
import { useProductsStore } from "../store/product";

export function useEditProductModal() {
  const modalInstance = ref<any>(null);
  const store = useProductsStore();
  const { data: product, refetch: refetchProduct } = useProductQuery();

  function openModal(product: Product) {
    if (!modalInstance.value) {
      modalInstance.value = useModal({
        component: EditProductModal,
        attrs: {
          product,
          onClose() {
            closeModal();
          },
          onUpdated() {
            // Refresh products list
            store.refetchProducts();
            refetchProduct();
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
