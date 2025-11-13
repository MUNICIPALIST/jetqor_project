import { ref, watch } from "vue";
import { useRoute } from "vue-router";

interface Breadcrumb {
  label: string;
  path: string;
}

// Словарь перевода стандартных путей на русский язык
const pathTranslations: Record<string, string> = {
  home: "Главная",
  orders: "Заказы",
  products: "Товары",
  invoices: "Накладные",
  settings: "Настройки",
  users: "Пользователи",
  warehouses: "Склады",
  profile: "Профиль",
  login: "Вход",
  register: "Регистрация"
};

export function useBreadcrumbs() {
  const route = useRoute();
  const breadcrumbs = ref<Breadcrumb[]>([]);

  const generateBreadcrumbs = () => {
    const paths = route.path.split("/").filter(Boolean);
    breadcrumbs.value = paths.map((path, index) => {
      // Получаем перевод из словаря или используем первую букву заглавной
      let label = pathTranslations[path] || path.charAt(0).toUpperCase() + path.slice(1);

      // Если это числовой идентификатор (например, ID заказа или товара)
      if (/^\d+$/.test(path)) {
        // Берем название предыдущего сегмента для контекста
        const prevPath = index > 0 ? paths[index - 1] : "";

        // Формируем соответствующую метку на русском
        if (prevPath === "orders") {
          label = `Заказ №${path}`;
        } else if (prevPath === "products") {
          label = `Товар №${path}`;
        } else if (prevPath === "invoices") {
          label = `Накладная №${path}`;
        } else if (prevPath === "users") {
          label = `Пользователь №${path}`;
        } else {
          label = `№${path}`;
        }
      }

      return {
        label,
        path: `/${paths.slice(0, index + 1).join("/")}`,
      };
    });

    breadcrumbs.value.unshift({ label: "Главная", path: "/" });
  };

  watch(route, generateBreadcrumbs, { immediate: true });

  return {
    breadcrumbs,
  };
}
