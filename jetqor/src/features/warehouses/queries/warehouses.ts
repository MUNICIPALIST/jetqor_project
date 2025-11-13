import type { Warehouse } from "../types";
import { defineQuery, useQuery } from "@pinia/colada";
import api from "~/plugins/api";

async function getWarehouses() {
  return await api<Warehouse[]>("/storage/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}

export const useWarehousesQuery = defineQuery(() => {
  const query = useQuery({
    key: () => ["warehouses"],
    query: () => getWarehouses(),
    staleTime: 30 * 1000,
  });

  return {
    ...query,
  };
});
