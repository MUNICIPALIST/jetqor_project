import type { Cell, Warehouse } from "../types";
import { defineStore } from "pinia";
import { useWarehousesQuery } from "../queries/warehouses";
import { warehouseService } from "../services/warehouseService";

interface RackRow {
  id: number;
  cells: Cell[];
}

interface Rack {
  id: number;
  rows: RackRow[];
}

interface RackMapRow {
  [rowId: number]: RackRow;
}

interface RackMapItem {
  id: number;
  rows: RackMapRow;
}

interface RacksMap {
  [rackId: number]: RackMapItem;
}

export const useWarehousesStore = defineStore("warehouses", () => {
  const { data: warehouses, isLoading: isLoadingWarehouses, refetch } = useWarehousesQuery();

  const currentWarehouseId = ref<number>(1);
  const isEditModalOpen = ref(false);

  // Local copy of warehouses data for modifications
  const localWarehouses = ref<Warehouse[]>([]);

  // Watch for changes in the query result and update local copy
  watch(() => warehouses.value, (newWarehouses) => {
    if (newWarehouses) {
      localWarehouses.value = [...newWarehouses];
    }
  }, { immediate: true });

  const currentWarehouse = computed(() => localWarehouses.value.find(warehouse => warehouse.id === currentWarehouseId.value));

  function initWarehouses() {
    if (warehouses.value?.length) {
      currentWarehouseId.value = warehouses.value[0].id;
    }
  }

  // Function to update warehouse information in-memory
  function updateWarehouse(id: string | number, data: { name: string; address: string; city: string }) {
    if (!localWarehouses.value.length)
      return;

    const warehouseId = typeof id === "string" ? Number.parseInt(id) : id;
    const index = localWarehouses.value.findIndex(w => w.id === warehouseId);

    if (index !== -1) {
      // Create updated warehouse object with merged data
      const updatedWarehouse = {
        ...localWarehouses.value[index],
        name: data.name,
        address: data.address,
        city: data.city,
      };

      // Create a new array with the updated warehouse to trigger reactivity
      localWarehouses.value = [
        ...localWarehouses.value.slice(0, index),
        updatedWarehouse,
        ...localWarehouses.value.slice(index + 1),
      ];
    }
  }

  // Function to refresh warehouse data from server
  async function refreshWarehouses() {
    console.warn("Refreshing warehouses data from server...");
    try {
      const result = await refetch();
      console.warn("Warehouses refreshed successfully:", result);

      // Force immediate update of the local warehouses data
      if (result.data) {
        console.warn("Updating localWarehouses with new data, count:", result.data.length);
        localWarehouses.value = [...result.data];
      }

      return result;
    }
    catch (error) {
      console.error("Error refreshing warehouses:", error);
      throw error;
    }
  }

  const currentRackId = ref<number | null>(null);
  const racks = computed<Rack[]>(() => {
    const warehouse = currentWarehouse.value;
    if (!warehouse) {
      return [];
    }

    const racksMap: RacksMap = {};

    warehouse.cells.forEach((cell) => {
      if (!racksMap[cell.rack]) {
        racksMap[cell.rack] = {
          id: cell.rack,
          rows: {},
        };
      }

      if (!racksMap[cell.rack].rows[cell.row]) {
        racksMap[cell.rack].rows[cell.row] = {
          id: cell.row,
          cells: [],
        };
      }

      racksMap[cell.rack].rows[cell.row].cells.push({
        id: cell.id,
        entites: cell.entites || [],
        article: cell.article,
        name: cell.name,
        rack: cell.rack,
        row: cell.row,
        created_at: cell.created_at,
        storageId: cell.storageId,
        updated_at: cell.updated_at,
      });
    });

    return Object.values(racksMap).map(rack => ({
      id: rack.id,
      rows: Object.values(rack.rows),
    }));
  });

  watch(racks, (newRacks) => {
    if (newRacks.length > 0 && !currentRackId.value) {
      currentRackId.value = newRacks[0].id;
    }
  }, { immediate: true });

  const currentRack = computed(() => racks.value.find(rack => rack.id === currentRackId.value));

  const racksOptions = computed(() => {
    return racks.value.map(rack => ({
      label: `Стеллаж ${rack.id}`,
      value: rack.id,
    }));
  });

  const warehouseRowsOnSelectedRack = computed((): RackRow[] => {
    return currentRack.value?.rows || [];
  });

  // Методы для управления складом
  async function addRack() {
    // TODO: Добавить API запрос
    const newRackId = Math.max(...racks.value.map(r => r.id)) + 1;
    console.warn("Adding rack:", newRackId);
  }

  async function deleteRack(rackId: number) {
    // TODO: Добавить API запрос
    console.warn("Deleting rack:", rackId);
  }

  async function addRow(rackId: number) {
    // TODO: Добавить API запрос
    const rack = racks.value.find(r => r.id === rackId);
    if (!rack)
      return;

    const newRowId = Math.max(...rack.rows.map(r => r.id)) + 1;
    console.warn("Adding row:", newRowId, "to rack:", rackId);
  }

  async function deleteRow(rackId: number, rowId: number) {
    // TODO: Добавить API запрос
    console.warn("Deleting row:", rowId, "from rack:", rackId);
  }

  async function addCell(rackId: number, rowId: number) {
    // TODO: Добавить API запрос
    const rack = racks.value.find(r => r.id === rackId);
    if (!rack)
      return;

    const row = rack.rows.find(r => r.id === rowId);
    if (!row)
      return;

    const newCellId = Math.max(...row.cells.map(c => c.id)) + 1;
    console.warn("Adding cell:", newCellId, "to row:", rowId, "rack:", rackId);
  }

  async function deleteCell(rackId: number, rowId: number, cellId: number) {
    try {
      // Вызываем функцию из warehouseService
      await warehouseService.deleteCell(cellId);

      // Обновляем локальное состояние
      const warehouse = localWarehouses.value.find(w => w.id === currentWarehouseId.value);
      if (warehouse) {
        // Находим ячейку в списке ячеек склада и удаляем её
        const cellIndex = warehouse.cells.findIndex(c => c.id === cellId);
        if (cellIndex !== -1) {
          warehouse.cells.splice(cellIndex, 1);
          console.warn("Cell deleted successfully:", cellId);
        }
      }
    }
    catch (error) {
      console.error("Failed to delete cell:", error);
      throw error;
    }
  }

  return {
    // Use localWarehouses instead of warehouses to make sure UI displays updated data
    warehouses: localWarehouses,
    isLoadingWarehouses,
    currentWarehouseId,
    currentWarehouse,
    racksOptions,
    currentRackId,
    initWarehouses,
    warehouseRowsOnSelectedRack,
    racks,
    isEditModalOpen,
    // Методы управления
    addRack,
    deleteRack,
    addRow,
    deleteRow,
    addCell,
    deleteCell,
    updateWarehouse,
    refreshWarehouses,
  };
});
