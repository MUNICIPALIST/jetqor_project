import { ref } from "vue";
import { useModal } from "vue-final-modal";
import DeclineInvoiceModal from "../components/modals/DeclineInvoiceModal.vue";

const modalInstance = ref<any>(null);
const isSuccess = ref(false);

export function useDeclineInvoiceModal() {
  function openModal(invoiceId: string | number) {
    isSuccess.value = false;

    // Закрыть предыдущее модальное окно, если оно существует
    if (modalInstance.value) {
      modalInstance.value.close();
      modalInstance.value = null;
    }

    // Создаём новый экземпляр модального окна
    modalInstance.value = useModal({
      component: DeclineInvoiceModal,
      attrs: {
        invoiceId, // Прокидываем id накладной как атрибут
        onClose() {
          closeModal();
        },
        onSuccess() {
          isSuccess.value = true;
          closeModal();
        },
      },
    });

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
    isSuccess,
  };
}
