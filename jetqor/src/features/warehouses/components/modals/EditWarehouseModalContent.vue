<script setup lang="ts">
import type { Cell } from "../../types";
import AppInput from "@/components/ui/AppInput/index.vue";
import BaseButton from "@/components/ui/BaseButton/index.vue";
import useToasters from "@/composables/useToasters";
import useUser from "~/features/user/composables/useUser";
import api from "~/plugins/api";
import { useWarehousesStore } from "../../store/warehouses";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "updated"): void;
}>();

const warehousesStore = useWarehousesStore();
const { success, error: showError } = useToasters();
const { isAdmin } = useUser();

const warehouseName = ref(warehousesStore.currentWarehouse?.name || "");
const warehouseCity = ref(warehousesStore.currentWarehouse?.city || "");
const warehouseAddress = ref(warehousesStore.currentWarehouse?.address || "");
const isLoading = ref(false);
const errorMessage = ref("");

// Данные для модального окна добавления ячейки
const showAddCellModal = ref(false);
const newCellName = ref("");
const newCellArticle = ref("");
const newCellRackId = ref<number | null>(null);
const newCellRowId = ref<number | null>(null);

// Данные для модальных окон удаления
const showDeleteCellModal = ref(false);
const cellToDelete = ref<{ id: number | string; rackId: number; rowId: number } | null>(null);

// Данные для модального окна удаления стеллажа
const showDeleteRackModal = ref(false);
const rackToDelete = ref<{ id: number; name: string } | null>(null);

// Данные для модального окна удаления ряда
const showDeleteRowModal = ref(false);
const rowToDelete = ref<{ id: number; name: string; rackId: number; rackName: string } | null>(null);

// Данные для локальных стеллажей и рядов
const localRacks = ref<{
  id: number;
  name: string;
  rows: {
    id: number;
    name: string;
    cells: {
      id: number | string;
      name: string;
      article: string;
      isNew?: boolean;
    }[];
  }[];
}[]>([]);
const nextRackId = ref(1);
const nextRowId = ref(1);

// Инициализация локальных стеллажей при открытии модального окна
onMounted(() => {
  // Загружаем существующие стеллажи, ряды и ячейки из текущего склада
  loadExistingWarehouseStructure();

  // Если нет стеллажей, создаем один для удобства
  if (localRacks.value.length === 0) {
    addRack();
  }
});

// Функция для загрузки существующей структуры склада
function loadExistingWarehouseStructure() {
  if (!warehousesStore.currentWarehouse)
    return;

  console.warn("Loading existing warehouse structure...");

  // Получаем все стеллажи для текущего склада из store
  const existingRacks = warehousesStore.racks;
  if (existingRacks.length === 0) {
    console.warn("No existing racks found");
    return;
  }

  console.warn("Found existing racks:", existingRacks.length);

  // Преобразуем данные из store в наш локальный формат
  const convertedRacks = existingRacks.map((rack) => {
    // Находим максимальный ID стеллажа для обновления nextRackId
    if (rack.id >= nextRackId.value) {
      nextRackId.value = rack.id + 1;
    }

    // Преобразуем ряды этого стеллажа
    const convertedRows = rack.rows.map((row) => {
      // Находим максимальный ID ряда для обновления nextRowId
      if (row.id >= nextRowId.value) {
        nextRowId.value = row.id + 1;
      }

      // Преобразуем ячейки этого ряда
      const convertedCells = row.cells.map((cell) => {
        return {
          id: cell.id,
          name: cell.name,
          article: cell.article,
        };
      });

      return {
        id: row.id,
        name: `Ряд ${row.id}`,
        cells: convertedCells,
      };
    });

    return {
      id: rack.id,
      name: `Стеллаж ${rack.id}`,
      rows: convertedRows,
    };
  });

  // Устанавливаем преобразованные данные в localRacks
  localRacks.value = convertedRacks;

  console.warn("Loaded existing warehouse structure with racks:", localRacks.value.length);
}

async function saveWarehouse() {
  if (!warehousesStore.currentWarehouse)
    return;

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const response = await api("https://api.jetqor.com/storage/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: warehousesStore.currentWarehouse.id.toString(),
        name: warehouseName.value,
        address: warehouseAddress.value,
        city: warehouseCity.value,
      },
    });

    if (response) {
      // Update the warehouse data in the store
      warehousesStore.updateWarehouse(
        warehousesStore.currentWarehouse.id,
        {
          name: warehouseName.value,
          address: warehouseAddress.value,
          city: warehouseCity.value,
        },
      );

      success("Склад успешно обновлен");
      // Emit updated event to parent
      emit("updated");
      emit("close");
    }
  }
  catch (error) {
    console.error("Error updating warehouse:", error);
    errorMessage.value = "Произошла ошибка при обновлении склада";
    showError("Ошибка при обновлении склада");
  }
  finally {
    isLoading.value = false;
  }
}

// Функция для добавления стеллажа
function addRack() {
  // Создаем новый стеллаж локально
  const rackId = nextRackId.value++;
  const rackName = `Стеллаж ${rackId}`;

  localRacks.value.push({
    id: rackId,
    name: rackName,
    rows: [],
  });

  success(`Стеллаж ${rackName} добавлен локально`);
}

// Функция для добавления ряда в стеллаж
function addRowToRack(rackId: number) {
  const rack = localRacks.value.find(r => r.id === rackId);
  if (!rack) {
    showError("Стеллаж не найден");
    return;
  }

  const rowId = nextRowId.value++;
  const rowName = `Ряд ${rowId}`;

  rack.rows.push({
    id: rowId,
    name: rowName,
    cells: [],
  });

  success(`Ряд ${rowName} добавлен в стеллаж ${rack.name}`);
}

// Функция для показа модального окна удаления стеллажа
function showDeleteRackConfirmation(rackId: number) {
  const rack = localRacks.value.find(r => r.id === rackId);
  if (!rack) {
    showError("Стеллаж не найден");
    return;
  }

  // Сохраняем информацию о стеллаже для удаления
  rackToDelete.value = {
    id: rack.id,
    name: rack.name,
  };

  // Показываем модальное окно подтверждения
  showDeleteRackModal.value = true;
}

// Функция для удаления стеллажа (после подтверждения)
function confirmDeleteRack() {
  if (!rackToDelete.value)
    return;

  const rackId = rackToDelete.value.id;
  const rackName = rackToDelete.value.name;

  // Удаляем стеллаж из локального массива
  const index = localRacks.value.findIndex(r => r.id === rackId);
  if (index !== -1) {
    localRacks.value.splice(index, 1);
    success(`Стеллаж "${rackName}" удален`);
  }

  // Закрываем модальное окно и сбрасываем данные
  showDeleteRackModal.value = false;
  rackToDelete.value = null;
}

// Функция для показа модального окна удаления ряда
function showDeleteRowConfirmation(rackId: number, rowId: number) {
  const rack = localRacks.value.find(r => r.id === rackId);
  if (!rack) {
    showError("Стеллаж не найден");
    return;
  }

  const row = rack.rows.find(r => r.id === rowId);
  if (!row) {
    showError("Ряд не найден");
    return;
  }

  // Сохраняем информацию о ряде для удаления
  rowToDelete.value = {
    id: rowId,
    name: row.name,
    rackId,
    rackName: rack.name,
  };

  // Показываем модальное окно подтверждения
  showDeleteRowModal.value = true;
}

// Функция для удаления ряда (после подтверждения)
function confirmDeleteRow() {
  if (!rowToDelete.value)
    return;

  const { rackId, id: rowId, name: rowName, rackName } = rowToDelete.value;

  // Находим стеллаж
  const rack = localRacks.value.find(r => r.id === rackId);
  if (!rack) {
    showError("Стеллаж не найден");
    return;
  }

  // Удаляем ряд из стеллажа
  const rowIndex = rack.rows.findIndex(r => r.id === rowId);
  if (rowIndex !== -1) {
    rack.rows.splice(rowIndex, 1);
    success(`Ряд "${rowName}" удален из стеллажа "${rackName}"`);
  }

  // Закрываем модальное окно и сбрасываем данные
  showDeleteRowModal.value = false;
  rowToDelete.value = null;
}

// Открыть модальное окно для добавления ячейки
function openAddCellModal(rackId: number, rowId: number) {
  // Находим соответствующий стеллаж и ряд
  const rack = localRacks.value.find(r => r.id === rackId);
  if (!rack) {
    showError("Стеллаж не найден");
    return;
  }

  const row = rack.rows.find(r => r.id === rowId);
  if (!row) {
    showError("Ряд не найден");
    return;
  }

  // Устанавливаем значения для модального окна
  newCellRackId.value = rackId;
  newCellRowId.value = rowId;
  newCellName.value = `Ячейка ${Date.now()}`;
  newCellArticle.value = `R${rackId}C${rowId}-${Math.floor(Math.random() * 1000)}`;

  showAddCellModal.value = true;
}

// Функция для создания новой ячейки
async function createCell() {
  if (!warehousesStore.currentWarehouse || !newCellRackId.value || newCellRowId.value === null) {
    showError("Не удалось определить склад, стеллаж или ряд");
    return;
  }

  // Проверка на заполненность обязательных полей
  if (!newCellName.value || !newCellArticle.value) {
    showError("Заполните название и артикул ячейки");
    return;
  }

  try {
    isLoading.value = true;
    console.warn("Отправляем данные для создания ячейки:", {
      name: newCellName.value,
      article: newCellArticle.value,
      storageId: warehousesStore.currentWarehouse.id,
      rack: newCellRackId.value,
      row: newCellRowId.value,
    });

    const response = await api<Cell>("https://api.jetqor.com/cell/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        name: newCellName.value,
        article: newCellArticle.value,
        storageId: warehousesStore.currentWarehouse.id,
        rack: Number(newCellRackId.value),
        row: Number(newCellRowId.value),
      },
    });

    if (response) {
      console.warn("Ячейка успешно создана:", response);
      success(`Ячейка ${newCellName.value} успешно добавлена`);

      // Добавляем ячейку в локальный стеллаж и ряд для немедленного отображения
      const rack = localRacks.value.find(r => r.id === newCellRackId.value);
      if (rack) {
        const row = rack.rows.find(r => r.id === newCellRowId.value);
        if (row) {
          row.cells.push({
            id: response.id,
            name: newCellName.value,
            article: newCellArticle.value,
            isNew: true,
          });
        }
      }

      // Закрываем модальное окно
      showAddCellModal.value = false;

      // Сбрасываем форму
      newCellName.value = "";
      newCellArticle.value = "";

      // Обновляем данные о складе
      await warehousesStore.refreshWarehouses();
    }
  }
  catch (err) {
    console.error("Error creating cell:", err);
    showError("Ошибка при создании ячейки");
  }
  finally {
    isLoading.value = false;
  }
}

// Функция для удаления ячейки по ID
async function deleteCell(cellId: number | string, rackId: number, rowId: number) {
  try {
    isLoading.value = true;

    console.warn("Отправляем запрос на удаление ячейки:", cellId);

    // Используем универсальный API-путь из сервиса для удаления ячейки
    const response = await api(`/cell/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: {
        id: cellId,
      },
    });

    if (response) {
      // Удаляем ячейку из локального представления
      const rack = localRacks.value.find(r => r.id === rackId);
      if (rack) {
        const row = rack.rows.find(r => r.id === rowId);
        if (row) {
          const cellIndex = row.cells.findIndex(c => c.id === cellId);
          if (cellIndex !== -1) {
            row.cells.splice(cellIndex, 1);
          }
        }
      }

      success(`Ячейка успешно удалена`);

      // Обновляем данные о складе
      await warehousesStore.refreshWarehouses();
    }
  }
  catch (err) {
    console.error("Error deleting cell:", err);
    showError("Ошибка при удалении ячейки");
  }
  finally {
    isLoading.value = false;
  }
}

// Функция для открытия модального окна подтверждения удаления
function confirmDeleteCell(cellId: number | string, rackId: number, rowId: number) {
  cellToDelete.value = { id: cellId, rackId, rowId };
  showDeleteCellModal.value = true;
}

// Функция для удаления ячейки после подтверждения
async function handleDeleteCell() {
  if (!cellToDelete.value)
    return;

  const { id, rackId, rowId } = cellToDelete.value;
  showDeleteCellModal.value = false;
  await deleteCell(id, rackId, rowId);
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="text-xl font-bold">
      Склад
    </div>

    <!-- Form -->
    <div class="flex flex-col gap-4">
      <!-- Warehouse name and city -->
      <div class="flex gap-4">
        <AppInput
          v-model="warehouseName"
          label="Наименование"
          class="flex-1"
          placeholder="Введите название склада"
        />
        <AppInput
          v-model="warehouseCity"
          label="Город"
          class="flex-1"
          placeholder="Введите город"
        />
      </div>

      <!-- Warehouse address -->
      <div>
        <AppInput
          v-model="warehouseAddress"
          label="Адрес"
          class="w-full"
          placeholder="Введите адрес склада"
        />
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="text-red-500 mt-2">
        {{ errorMessage }}
      </div>

      <!-- Save button -->
      <div class="mt-4 flex justify-end">
        <BaseButton
          variant="primary"
          :loading="isLoading"
          @click="saveWarehouse"
        >
          Сохранить
        </BaseButton>
      </div>
    </div>

    <!-- Структура склада: стеллажи, ряды и ячейки -->
    <div class="mt-6 border-t border-gray-200 pt-6">
      <div class="flex items-center justify-between">
        <div class="text-xl font-bold">
          Стеллажи
        </div>
        <BaseButton variant="primary" @click="addRack">
          <span class="i-jq-plus-filled mr-2 h-4 w-4" />
          Добавить стеллаж
        </BaseButton>
      </div>

      <div v-if="!localRacks.length" class="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
        <div class="size-16 flex items-center justify-center rounded-full bg-gray-100">
          <div class="i-jq-category size-8" />
        </div>
        <div class="text-xl font-bold">
          Добавьте стеллаж
        </div>
        <div class="text-gray-500">
          Для начала нужно создать хотя бы один стеллаж
        </div>
        <BaseButton variant="primary" @click="addRack">
          Добавить стеллаж
        </BaseButton>
      </div>

      <div v-else class="mt-4 flex flex-1 flex-col gap-4">
        <!-- Отображение стеллажей -->
        <div v-for="rack in localRacks" :key="rack.id" class="overflow-hidden border border-gray-200 rounded-lg">
          <!-- Заголовок стеллажа -->
          <div class="flex items-center justify-between bg-gray-50 p-4">
            <div class="flex items-center gap-2">
              <div class="i-jq-card-box size-5 text-gray-700" />
              <div class="font-medium">
                {{ rack.name }}
              </div>
            </div>
            <div class="flex gap-2">
              <BaseButton variant="primary" size="sm" @click="addRowToRack(rack.id)">
                <span class="i-jq-plus-filled mr-1 h-3 w-3" />
                Добавить ряд
              </BaseButton>
              <BaseButton v-if="isAdmin" variant="error-outline" size="sm" @click="showDeleteRackConfirmation(rack.id)">
                <span class="i-jq-close mr-1 h-3 w-3" />
                Удалить стеллаж
              </BaseButton>
            </div>
          </div>

          <!-- Ряды стеллажа -->
          <div class="flex flex-col gap-4 p-4">
            <div v-if="rack.rows.length === 0" class="py-6 text-center text-gray-500">
              Нет рядов в этом стеллаже
            </div>

            <div v-for="row in rack.rows" :key="row.id" class="border border-gray-200 rounded-lg">
              <!-- Заголовок ряда -->
              <div class="flex items-center justify-between bg-gray-50 p-3">
                <div class="flex items-center gap-2">
                  <div class="font-medium">
                    {{ row.name }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <BaseButton variant="secondary" size="sm" @click="openAddCellModal(rack.id, row.id)">
                    <span class="i-jq-plus-filled mr-1 h-3 w-3" />
                    Добавить ячейку
                  </BaseButton>
                  <BaseButton variant="secondary" size="sm" @click="showDeleteRowConfirmation(rack.id, row.id)">
                    <span class="i-jq-close mr-1 h-3 w-3" />
                    Удалить ряд
                  </BaseButton>
                </div>
              </div>

              <!-- Содержимое ряда (ячейки) -->
              <div class="p-4">
                <div v-if="row.cells.length === 0" class="py-6 text-center text-gray-500">
                  Нет ячеек в этом ряду
                </div>

                <div v-else class="grid grid-cols-2 gap-3">
                  <div
                    v-for="cell in row.cells"
                    :key="cell.id"
                    class="border border-gray-200 rounded-lg p-3"
                    :class="{ 'border-green-300 bg-green-50': cell.isNew }"
                  >
                    <div class="flex items-center justify-between">
                      <div class="mb-1 font-medium">
                        {{ cell.name }}
                      </div>
                      <button
                        class="text-red-500 hover:text-red-700 transition-colors"
                        title="Удалить ячейку"
                        @click="confirmDeleteCell(cell.id, rack.id, row.id)"
                      >
                        <div class="i-jq-close size-4" />
                      </button>
                    </div>
                    <div class="text-sm text-gray-500">
                      Артикул: {{ cell.article }}
                    </div>
                  </div>
                </div>

                <div class="mt-3 flex justify-center">
                  <BaseButton variant="secondary" size="sm" @click="openAddCellModal(rack.id, row.id)">
                    <span class="i-jq-plus-filled mr-1 h-3 w-3" />
                    Добавить новую ячейку
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления ячейки -->
    <Teleport to="body">
      <div v-if="showAddCellModal" class="fixed inset-0 z-[1004] flex items-center justify-center bg-black/50">
        <div class="w-[500px] rounded-lg bg-white p-6 shadow-lg">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold">
              Добавление ячейки
            </h3>
            <button class="text-gray-400 hover:text-gray-600" @click="showAddCellModal = false">
              <div class="i-jq-close size-4" />
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <div>
              <AppInput
                v-model="newCellName"
                label="Название ячейки"
                placeholder="Введите название ячейки"
                class="w-full"
              />
            </div>

            <div>
              <AppInput
                v-model="newCellArticle"
                label="Артикул ячейки"
                placeholder="Введите артикул ячейки"
                class="w-full"
              />
            </div>

            <div class="flex gap-4">
              <div class="w-full">
                <label class="mb-1 block text-sm text-gray-700 font-medium">Номер стеллажа</label>
                <div class="border rounded bg-gray-50 p-2">
                  {{ newCellRackId }}
                </div>
              </div>

              <div class="w-full">
                <label class="mb-1 block text-sm text-gray-700 font-medium">Номер ряда</label>
                <div class="border rounded bg-gray-50 p-2">
                  {{ newCellRowId }}
                </div>
              </div>
            </div>

            <div class="mt-2 flex justify-end">
              <BaseButton variant="secondary" class="mr-2" @click="showAddCellModal = false">
                Отмена
              </BaseButton>
              <BaseButton variant="primary" :loading="isLoading" @click="createCell">
                Создать
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модальное окно для подтверждения удаления ячейки -->
    <Teleport to="body">
      <div v-if="showDeleteCellModal" class="fixed inset-0 z-[1005] flex items-center justify-center bg-black/50">
        <div class="w-[480px] rounded-lg bg-white p-6 shadow-lg">
          <div class="text-center">
            <div class="i-jq-info mx-auto mb-4 size-16 text-yellow-500" />
            <h3 class="mb-2 text-xl text-gray-900 font-bold">
              Подтвердите удаление ячейки
            </h3>
            <div class="space-y-2">
              <p class="text-gray-600">
                Вы действительно хотите удалить эту ячейку?
              </p>
              <div class="rounded-lg bg-yellow-50 p-4">
                <div class="flex gap-2">
                  <div class="i-jq-info mt-1 size-5 shrink-0 text-yellow-400" />
                  <p class="text-sm text-yellow-700">
                    Внимание! При удалении ячейки все товары, находящиеся в ней,
                    будут автоматически перемещены в соседние свободные ячейки этого ряда.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-center gap-3">
              <BaseButton
                variant="secondary"
                @click="showDeleteCellModal = false"
              >
                Отменить
              </BaseButton>
              <BaseButton
                variant="error-outline"
                :loading="isLoading"
                @click="handleDeleteCell"
              >
                Удалить ячейку
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модальное окно подтверждения удаления стеллажа -->
    <div v-if="showDeleteRackModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="max-w-md w-full rounded-lg bg-white p-6">
        <div class="mb-4 text-xl font-bold">
          Удаление стеллажа
        </div>
        <div class="mb-6">
          <p>Вы уверены, что хотите удалить стеллаж "{{ rackToDelete?.name }}"?</p>
          <p class="text-red-500 mt-2">
            Внимание: Все ряды и ячейки в этом стеллаже также будут удалены. Это действие нельзя отменить.
          </p>
        </div>
        <div class="flex justify-end gap-4">
          <BaseButton variant="secondary" @click="showDeleteRackModal = false; rackToDelete = null">
            Отмена
          </BaseButton>
          <BaseButton variant="error-outline" @click="confirmDeleteRack">
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления ряда -->
    <div v-if="showDeleteRowModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="max-w-md w-full rounded-lg bg-white p-6">
        <div class="mb-4 text-xl font-bold">
          Удаление ряда
        </div>
        <div class="mb-6">
          <p>Вы уверены, что хотите удалить ряд "{{ rowToDelete?.name }}" из стеллажа "{{ rowToDelete?.rackName }}"?</p>
          <p class="text-red-500 mt-2">
            Внимание: Все ячейки в этом ряду также будут удалены. Это действие нельзя отменить.
          </p>
        </div>
        <div class="flex justify-end gap-4">
          <BaseButton variant="secondary" @click="showDeleteRowModal = false; rowToDelete = null">
            Отмена
          </BaseButton>
          <BaseButton variant="error-outline" @click="confirmDeleteRow">
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
