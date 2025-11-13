import type { User } from "../types";
import { defineQuery, useQuery } from "@pinia/colada";
import { computed } from "vue";
import { useRoute } from "vue-router";
import api from "~/plugins/api";

async function getUsers() {
  try {
    return await api<User[]>("/user/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }
  catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export const useUsersQuery = defineQuery(() => {
  const query = useQuery({
    key: () => ["users"],
    query: () => getUsers(),
    staleTime: 30 * 1000,
    placeholderData: () => [],
  });

  return {
    ...query,
  };
});

async function getUser(id: string) {
  try {
    if (!id)
      throw new Error("User ID is required");

    return await api<User>(`/user/id/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }
  catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export const useUserQuery = defineQuery(() => {
  const route = useRoute();
  const userId = computed(() => {
    const id = String(route.params.id || "");
    return id !== "undefined" && id !== "" ? id : null;
  });

  const enabled = computed(() => !!userId.value);

  const query = useQuery({
    key: () => ["user", String(userId.value || "")],
    query: async () => {
      if (!userId.value)
        return Promise.resolve(null);
      return getUser(userId.value);
    },
    staleTime: 30 * 1000,
    enabled,
  });

  return {
    ...query,
  };
});
