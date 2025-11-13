import { ref } from "vue";
import { useModal } from "vue-final-modal";
import { cellService } from "../services/cellService";
import { useWarehousesStore } from "../store/warehouses";

interface NewCellData {
  rack: number;
  row: number;
  cellCount: number;
}

export function useAddCellRow() {
  const warehousesStore = useWarehousesStore();
  const isLoading = ref(false);

  async function createCells({ rack, row, cellCount }: NewCellData) {
    try {
      isLoading.value = true;
      const cells = Array.from({ length: cellCount }, (_, index) => ({
        name: (index + 1).toString(),
        article: `R${rack}C${index + 1}`,
        storageId: warehousesStore.currentWarehouse!.id,
        rack,
        row,
      }));

      await Promise.all(cells.map(cell => cellService.create(cell)));

      return true;
    }
    catch (error) {
      console.error("Error creating cells:", error);
      return false;
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    createCells,
  };
}
