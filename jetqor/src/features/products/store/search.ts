import { defineStore } from "pinia";

export const useSearchProductStore = defineStore("searchProduct", () => {
  const route = useRoute();
  const router = useRouter();

  const page = computed({
    get: () => Number(route.query.page) || 1,
    set: (value) => {
      router.push({
        query: {
          ...route.query,
          page: value.toString(),
        },
      });
    },
  });

  const size = computed({
    get: () => Number(route.query.size) || 5,
    set: (value) => {
      router.push({
        query: {
          ...route.query,
          size: value.toString(),
        },
      });
    },
  });

  const searchQuery = computed({
    get: () => route.query.search?.toString() || "",
    set: (value) => {
      router.push({
        query: {
          ...route.query,
          search: value || undefined,
          page: "1", // Сброс страницы при поиске
        },
      });
    },
  });

  return {
    page,
    size,
    searchQuery,
  };
});
