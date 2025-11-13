import type { User } from "~/types";
import { defineQuery, useQuery } from "@pinia/colada";
import api from "~/plugins/api";

export const getUser = defineQuery(() => {
  async function getUser() {
    const token = localStorage.getItem("token");
    return await api<User>("/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  const query = useQuery({
    key: () => ["user", "me"],
    query: () => getUser(),
    staleTime: 10 * 60 * 1000,
  });

  return {
    ...query,
  };
});
