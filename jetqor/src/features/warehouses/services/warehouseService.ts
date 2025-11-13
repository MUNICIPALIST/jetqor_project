import type { Warehouse } from "../types";
import api from "~/plugins/api";

interface CellCreationPayload {
  name: string;
  article: string;
  storageId: number;
  rack: number;
  row: number;
}

interface RackCreationPayload {
  name: string;
  storageId: number;
}

interface RowCreationPayload {
  name: string;
  rackId: number;
}

export const warehouseService = {
  async getWarehouses(): Promise<Warehouse[]> {
    console.warn("Fetching warehouses from API...");
    try {
      const warehouses = await api<Warehouse[]>("/storage/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.warn("Received warehouses:", warehouses);
      return warehouses;
    }
    catch (error) {
      console.error("Error fetching warehouses:", error);
      throw error;
    }
  },

  async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
    console.warn("Creating warehouse with data:", data);
    try {
      const response = await api<Warehouse>("/storage/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: {
          name: data.name,
          city: data.city,
          address: data.address,
        },
      });
      console.warn("Warehouse created successfully:", response);
      return response;
    }
    catch (error) {
      console.error("Error in createWarehouse:", error);
      throw error;
    }
  },

  async updateWarehouse(id: number, data: Partial<Warehouse>): Promise<Warehouse> {
    return api<Warehouse>(`/storage/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async deleteWarehouse(id: number): Promise<void> {
    return api<void>(`/storage/${id}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async createCell(payload: CellCreationPayload) {
    return api("/cell/create", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async createRack(payload: RackCreationPayload) {
    // This is a placeholder for the actual API endpoint
    // In your implementation, this would call the appropriate endpoint
    return api("/rack/create", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async createRow(payload: RowCreationPayload) {
    // This is a placeholder for the actual API endpoint
    // In your implementation, this would call the appropriate endpoint
    return api("/row/create", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async getWarehouseStructure(warehouseId: number) {
    // This is a placeholder for the API that would return the complete
    // structure of a warehouse including racks, rows and cells
    return api(`/storage/${warehouseId}/structure`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  async deleteCell(cellId: number) {
    return api(`/cell/delete`, {
      method: "POST",
      body: {
        id: cellId,
      },
    });
  },
};
