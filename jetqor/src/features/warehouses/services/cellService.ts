import api from "@/plugins/api";

interface CreateCellDto {
  name: string;
  article: string;
  storageId: number;
  rack: number;
  row: number;
}

export const cellService = {
  async create(data: CreateCellDto) {
    return api("/cell/create", {
      method: "POST",
      body: data,
    });
  },

  async delete(id: number) {
    return api(`/cell/${id}`, {
      method: "DELETE",
    });
  },
};
