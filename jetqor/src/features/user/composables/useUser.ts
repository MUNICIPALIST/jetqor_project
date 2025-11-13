import { computed } from "vue";
import { useUserStore } from "../stores/user";

export function useUser() {
  const userStore = useUserStore();

  const user = computed(() => userStore.user);
  const isAuthenticated = computed(() => !!userStore.user);

  const role = computed(() => user.value?.role ?? null);
  const isAdmin = computed(() => role.value === "administrator");
  const isClient = computed(() => role.value === "client");
  const isManager = computed(() => role.value === "manager");

  return {
    user,
    isAuthenticated,
    isAdmin,
    isClient,
    isManager,
    role,
  };
}

export default useUser;
