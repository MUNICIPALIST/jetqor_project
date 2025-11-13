import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWarehousesQuery } from "../../queries/warehouses";
import { useWarehousesStore } from "../warehouses";

// Мок для запроса получения складов
vi.mock("../../queries/warehouses", () => ({
  useWarehousesQuery: vi.fn(),
}));

// Моковые данные для тестирования
const mockWarehouses = [
  {
    id: 1,
    name: "Склад 1",
    cells: [
      { id: 1, rack: 1, row: 1, entites: [] },
      { id: 2, rack: 1, row: 1, entites: [{ id: 101, name: "Товар 1" }] },
      { id: 3, rack: 1, row: 2, entites: [] },
      { id: 4, rack: 2, row: 1, entites: [{ id: 102, name: "Товар 2" }] },
    ],
  },
  {
    id: 2,
    name: "Склад 2",
    cells: [
      { id: 5, rack: 1, row: 1, entites: [] },
    ],
  },
];

describe("warehouses Store", () => {
  beforeEach(() => {
    // Создаем и устанавливаем новый экземпляр pinia перед каждым тестом
    setActivePinia(createPinia());

    // Устанавливаем мок для useWarehousesQuery
    vi.mocked(useWarehousesQuery).mockReturnValue({
      data: { value: mockWarehouses },
      isLoading: { value: false },
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return warehouses data", () => {
    const store = useWarehousesStore();
    expect(store.warehouses.value).toEqual(mockWarehouses);
  });

  it("should set the first warehouse as current initially", () => {
    const store = useWarehousesStore();
    store.initWarehouses();
    expect(store.currentWarehouseId).toBe(1);
  });

  it("should return the correct current warehouse", () => {
    const store = useWarehousesStore();
    store.currentWarehouseId = 2;
    expect(store.currentWarehouse).toEqual(mockWarehouses[1]);
  });

  it("should transform warehouse data into racks structure", () => {
    const store = useWarehousesStore();
    store.currentWarehouseId = 1;

    // Проверяем структуру стеллажей
    expect(store.racks.length).toBe(2);
    expect(store.racks[0].id).toBe(1);
    expect(store.racks[0].rows.length).toBe(2);
    expect(store.racks[1].id).toBe(2);
    expect(store.racks[1].rows.length).toBe(1);
  });

  it("should set the first rack as current initially", () => {
    const store = useWarehousesStore();
    store.currentWarehouseId = 1;

    // Должен установить первый стеллаж как текущий
    expect(store.currentRackId).toBe(1);
  });

  it("should generate correct rack options", () => {
    const store = useWarehousesStore();
    store.currentWarehouseId = 1;

    expect(store.racksOptions).toEqual([
      { label: "Стеллаж 1", value: 1 },
      { label: "Стеллаж 2", value: 2 },
    ]);
  });

  it("should return rows for the selected rack", () => {
    const store = useWarehousesStore();
    store.currentWarehouseId = 1;
    store.currentRackId = 1;

    // Ожидаем получить ряды для стеллажа 1
    expect(store.warehouseRowsOnSelectedRack.length).toBe(2);
    expect(store.warehouseRowsOnSelectedRack[0].id).toBe(1);
    expect(store.warehouseRowsOnSelectedRack[0].cells.length).toBe(2);
  });

  it("should handle empty warehouses", () => {
    // Имитируем пустой массив складов
    vi.mocked(useWarehousesQuery).mockReturnValue({
      data: { value: [] },
      isLoading: { value: false },
    } as any);

    const store = useWarehousesStore();

    // Проверяем, что все работает корректно при пустых данных
    expect(store.warehouses.value).toEqual([]);
    expect(store.racks).toEqual([]);
    expect(store.racksOptions).toEqual([]);
    expect(store.warehouseRowsOnSelectedRack).toEqual([]);
  });

  it("should handle missing warehouse", () => {
    const store = useWarehousesStore();
    store.currentWarehouseId = 999; // Несуществующий склад

    expect(store.currentWarehouse).toBeUndefined();
    expect(store.racks).toEqual([]);
  });
});
