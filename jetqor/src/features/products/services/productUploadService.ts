import api from "~/plugins/api";

export async function uploadExcelFile(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Токен авторизации не найден");
  }

  try {
    await api("/product/excel-data", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        // Не устанавливаем Content-Type, браузер автоматически установит multipart/form-data
      },
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    
    // Обработка различных типов ошибок
    if (error instanceof Error) {
      throw new Error(`Ошибка загрузки: ${error.message}`);
    }
    
    throw new Error("Произошла неизвестная ошибка при загрузке файла");
  }
}
