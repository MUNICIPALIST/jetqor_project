/**
 * Универсальная функция для обработки асинхронных операций с типизацией
 * @param promise - Promise который нужно обработать
 * @returns кортеж [ошибка, результат]
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<[E | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  }
  catch (error) {
    return [error as E, null];
  }
}

/**
 * Пример использования:
 *
 * const [error, data] = await tryCatch(api.someRequest())
 *
 * if (error) {
 *   // Обработка ошибки
 *   console.error(error)
 *   return
 * }
 *
 * // Использование данных
 * console.log(data)
 */
