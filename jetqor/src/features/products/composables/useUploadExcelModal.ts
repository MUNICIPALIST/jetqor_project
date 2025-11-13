import { useModal } from "vue-final-modal";
import UploadExcelModal from "../components/modals/UploadExcelModal.vue";

export function useUploadExcelModal() {
  const { open, close } = useModal({
    component: UploadExcelModal,
    attrs: {
      onClose: () => {
        close();
      },
      onUploaded: () => {
        close();
      },
    },
  });

  return {
    openModal: open,
    closeModal: close,
  };
}
