import type { ExternalToast } from "vue-sonner";
import { toast } from "vue-sonner";

export default function useToasters() {
  return {
    success(message: string, options?: ExternalToast) {
      toast.success(message, options);
    },
    error(message: string, options?: ExternalToast) {
      toast.error(message, options);
    },
    info(message: string, options?: ExternalToast) {
      toast.info(message, options);
    },
  };
}
