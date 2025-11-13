import type { Shelf, WarehouseCell, WarehouseRow } from "../types";
import { computed, ref, watch } from "vue";
import { useWarehousesStore } from "~/features/warehouses/store/warehouses";

export function useWarehouse() {
  // Используем существующий стор для работы с данными склада
  const warehousesStore = useWarehousesStore();

  // Инициализируем данные склада при необходимости
  if (!warehousesStore.warehouses?.length) {
    warehousesStore.initWarehouses();
  }

  // Стеллажи - преобразуем данные из стора в наш формат
  const shelves = computed<Shelf[]>(() => {
    return warehousesStore.racksOptions.map(rack => ({
      id: rack.value,
      label: rack.label,
    }));
  });

  // Привязываем выбранный стеллаж к стору
  const selectedShelf = computed({
    get: () => warehousesStore.currentRackId || 0,
    set: (value) => {
      if (warehousesStore.currentRackId !== value) {
        warehousesStore.currentRackId = value;
      }
    },
  });

  // Преобразуем rows из стора в формат, который ожидает наш компонент
  const rows = computed<WarehouseRow[]>(() => {
    const warehouseRows = warehousesStore.warehouseRowsOnSelectedRack || [];

    return warehouseRows.map((row: any): WarehouseRow => {
      // Преобразуем ячейки в наш формат
      const cells: WarehouseCell[] = row.cells.map((cell: any): WarehouseCell => {
        return {
          id: cell.id,
          name: `Ячейка ${cell.id}`,
          code: `C-${row.id}-${cell.id}`,
        };
      });

      return {
        id: row.id,
        label: `Ряд ${row.id}`,
        cells: cells.length,
        items: cells,
      };
    });
  });

  // Функция для получения стеллажей для конкретного склада
  async function fetchShelvesForWarehouse(warehouseId: number) {
    // В реальном приложении здесь можно было бы сделать дополнительные запросы
    // или фильтрацию данных по складу
    warehousesStore.currentWarehouseId = warehouseId;
    return shelves.value;
  }

  // Функция для получения рядов для конкретного стеллажа
  async function fetchRowsForShelf(shelfId: number) {
    warehousesStore.currentRackId = shelfId;
    return rows.value;
  }

  return {
    shelves,
    selectedShelf,
    rows,
    fetchShelvesForWarehouse,
    fetchRowsForShelf,
  };
}
