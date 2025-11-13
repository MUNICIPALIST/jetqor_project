import { defineStore } from "pinia";
import { getUser } from "../queries/user";

export const useUserStore = defineStore("user", () => {
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = getUser();

  return {
    user,
    isLoadingUser,
    refetchUser,
  };
});
