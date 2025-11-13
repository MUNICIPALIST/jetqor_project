<script lang="ts" setup>
// import { Motion } from "@vueuse/motion"; // Временно отключено
import Breadcrumbs from "~/components/Breadcrumbs.vue";
import AppHeader from "~/components/ui/AppHeader.vue";

const route = useRoute();

// Словарь переводов названий страниц на русский язык
const pageTranslations: Record<string, string> = {
  "Home": "Главная",
  "Orders": "Заказы",
  "Products": "Товары",
  "Invoices": "Накладные",
  "Settings": "Настройки",
  "Users": "Пользователи",
  "Warehouses": "Склады",
  "Profile": "Профиль",
  "Login": "Вход",
  "Register": "Регистрация",
  "Order details": "Детали заказа",
  "Product details": "Информация о товаре",
  "Invoice details": "Детали накладной",
  "User management": "Управление пользователями",
  "Warehouse management": "Управление складами",
};

// Получаем переведённое название страницы или оставляем оригинальное, если перевода нет
const pageTitle = computed(() => {
  const routeName = route.name?.toString() || "";
  const routePath = route.path;

  // Если это корневой путь "/", возвращаем "Главная"
  if (routePath === "/" || routeName === "/") {
    return "Главная";
  }

  // Очищаем название от слэшей и обрабатываем специальные случаи
  const cleanedName = routeName.replace(/^\//g, "").replace(/\/$/g, "");

  // Если путь содержит динамические сегменты (идентификаторы), обрабатываем их отдельно
  if (cleanedName.includes("orders") && route.params.id) {
    return `Заказ №${route.params.id}`;
  }
  else if (cleanedName.includes("products") && route.params.id) {
    return `Товар №${route.params.id}`;
  }
  else if (cleanedName.includes("invoices") && route.params.id) {
    return `Накладная №${route.params.id}`;
  }
  else if (cleanedName.includes("users") && route.params.id) {
    return `Пользователь №${route.params.id}`;
  }

  // Проверяем, есть ли перевод для очищенного имени
  return pageTranslations[cleanedName]
  // Если нет, проверяем основные разделы
    || (cleanedName.includes("orders")
      ? "Заказы"
      : cleanedName.includes("products")
        ? "Товары"
        : cleanedName.includes("invoices")
          ? "Накладные"
          : cleanedName.includes("settings")
            ? "Настройки"
            : cleanedName.includes("users")
              ? "Пользователи"
              : cleanedName.includes("warehouses")
                ? "Склады"
                : cleanedName);
});

function downloadReport() {
  // Implementation for downloading report
  console.log("Downloading report...");
}

// Форматирование текущей даты на русском языке
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});
</script>

<template>
  <div class="size-full min-h-100vh bg-background p-8 pl-30 pt-30">
    <AppHeader />
    <Motion
      as="div"
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.1 }"
    >
      <Breadcrumbs class="mb-4" />
    </Motion>
    <Motion
      as="div"
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.3 }"
    >
      <PageHeader
        :title="pageTitle"
        :date="currentDate"
        :on-download="downloadReport"
      />
    </Motion>
    <Motion
      as="div"
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.5 }"
    >
      <RouterView />
    </Motion>
  </div>
</template>

<style>
/* Add any necessary styles here */
</style>
