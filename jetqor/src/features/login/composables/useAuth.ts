import { type } from "arktype";
import useToasters from "~/composables/useToasters";
import { useDetailedProductsStore } from "~/features/invoices/store/detailedProducts";
import { useProductDistributionStore } from "~/features/invoices/store/productDistribution";
import { useClientInvoiceStore } from "~/features/invoices/stores/clientInvoice";
import { useOrderProductDistributionStore } from "~/features/orders/store/orderProductDistribution";
import { useProductsStore } from "~/features/products/store/product";
import { useSearchProductStore } from "~/features/products/store/search";
import { useUserStore } from "~/features/user/stores/user";
import { useWarehousesStore } from "~/features/warehouses/store/warehouses";
import api from "~/plugins/api";

const authFormType = type({
  email: "string.email",
  password: "string >= 6",
});

const authForm = ref({
  email: "",
  password: "",
});

export default function useAuth() {
  const router = useRouter();
  const { error } = useToasters();

  const clearAllStores = () => {
    try {
      // Для stores с setup syntax очищаем состояние через методы stores или $patch

      const warehousesStore = useWarehousesStore();
      const productsStore = useProductsStore();
      const searchProductStore = useSearchProductStore();
      const detailedProductsStore = useDetailedProductsStore();
      const productDistributionStore = useProductDistributionStore();
      const clientInvoiceStore = useClientInvoiceStore();
      const orderProductDistributionStore = useOrderProductDistributionStore();

      // User store обновится автоматически после удаления токена
      // так как использует Pinia Colada

      // Warehouses store - очищаем основные данные
      warehousesStore.$patch({
        warehouses: [],
      });

      // Products store - сбрасываем вкладку
      productsStore.$patch({
        selectedTab: "all",
      });

      // Search store - сбрасываем поиск
      searchProductStore.$patch({
        searchQuery: "",
        page: 1,
        size: 10,
      });

      // Detailed products store - используем встроенный метод очистки
      detailedProductsStore.clearProducts();

      // Product distribution store - очищаем массивы
      productDistributionStore.$patch({
        distributedProducts: [],
        invoiceProducts: [],
      });

      // Client invoice store - очищаем выбранные продукты
      clientInvoiceStore.$patch({
        selectedProducts: [],
        selectedStorageId: null,
      });

      // Order product distribution store - очищаем массивы
      orderProductDistributionStore.$patch({
        distributedProducts: [],
        orderProducts: [],
      });
    }
    catch (error) {
      console.error("Ошибка при очистке stores:", error);
    }
  };

  // Функция для проверки состояния stores (только для разработки)
  const checkStoresState = () => {
    const warehousesStore = useWarehousesStore();
    const productsStore = useProductsStore();
    const detailedProductsStore = useDetailedProductsStore();

    return {
      warehousesCount: warehousesStore.warehouses?.length || 0,
      productsCount: productsStore.products?.length || 0,
      detailedProductsCount: detailedProductsStore.products?.length || 0,
      selectedTab: productsStore.selectedTab,
      hasToken: !!localStorage.getItem("token"),
      isEmpty: (!warehousesStore.warehouses || warehousesStore.warehouses.length === 0)
        && (!productsStore.products || productsStore.products.length === 0)
        && (!detailedProductsStore.products || detailedProductsStore.products.length === 0)
        && !localStorage.getItem("token"),
    };
  };

  async function auth() {
    const out = authFormType(authForm.value);
    if (out instanceof type.errors) {
      error("Неверный логин или пароль");
      return;
    }

    async function authLogin() {
      return api("/auth/login", {
        method: "POST",
        body: {
          email: authForm.value.email,
          password: authForm.value.password,
        },
      });
    }

    const [err, response] = await tryCatch(authLogin());
    if (err) {
      console.error(err);
      error("Неверный логин или пароль");
      return;
    }
    localStorage.setItem("token", response.token);
    await useUserStore().refetchUser();
    router.push("/");
  }

  const logout = () => {
    // Очищаем все Pinia stores
    clearAllStores();

    // Удаляем токен из localStorage
    localStorage.removeItem("token");

    // Перенаправляем на страницу входа
    router.push("/login");
  };

  return {
    authForm,
    auth,
    logout,
    checkStoresState, // Для разработки и тестирования
  };
}
