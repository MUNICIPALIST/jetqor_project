<script setup lang="ts">
// import { Motion } from "@vueuse/motion"; // Временно отключено
import { useRoute } from "vue-router";
import useAuth from "~/features/login/composables/useAuth";
import useUser from "~/features/user/composables/useUser";

const isCollapsed = ref(true);
const sidebarRef = ref<HTMLElement | null>(null);

interface NavItem {
  name: string;
  icon: string;
  path: string;
  roles?: ("administrator" | "manager" | "client")[];
}

const route = useRoute();
const { role } = useUser();

const allNavItems = ref<NavItem[]>([
  {
    name: "Главная",
    icon: "i-jq-home",
    path: "/",
    roles: ["administrator", "manager"],
  },
  {
    name: "Товары",
    icon: "i-jq-shopping-cart",
    path: "/products",
    roles: ["administrator", "manager", "client"],
  },
  {
    name: "Заказы",
    icon: "i-jq-bag",
    path: "/orders",
    roles: ["administrator", "manager", "client"],
  },
  {
    name: "Накладные",
    icon: "i-jq-category",
    path: "/invoices",
    roles: ["administrator", "manager", "client"],
  },
  {
    name: "Склады",
    icon: "i-jq-card-box",
    path: "/warehouses",
    roles: ["administrator", "manager"],
  },
  {
    name: "Пользователи",
    icon: "i-jq-users",
    path: "/users",
    roles: ["administrator"],
  },
  {
    name: "Настройки",
    icon: "i-jq-settings",
    path: "/settings",
    roles: ["administrator", "manager", "client"],
  },
]);

const navItems = computed(() => {
  if (!role.value)
    return [];
  return allNavItems.value.filter(item =>
    !item.roles || item.roles.includes(role.value as "administrator" | "manager" | "client"),
  );
});

function isActive(path: string) {
  if (path === "/" && route.path === "/")
    return true;
  if (path !== "/")
    return route.path.startsWith(path);
  return false;
}
</script>

<template>
  <Motion
    ref="sidebarRef"
    as="aside"
    class="fixed left-0 top-0 h-100dvh flex flex-col justify-between rounded-r-8 bg-second p-6 transition-width duration-300"
    :class="{ 'w-340px': !isCollapsed, 'w-88px hover:w-340px': isCollapsed }"
    :initial="{ x: isCollapsed ? -88 : -340 }"
    :animate="{ x: 0 }"
    :transition="{ type: 'spring', stiffness: 200, damping: 40 }"
    @mouseenter="isCollapsed = false"
    @mouseleave="isCollapsed = true"
  >
    <!-- Logo section -->
    <div class="mb-8 flex items-center gap-3">
      <img src="/logo.svg" alt="Jetqor" class="h-12">
      <div class="h-fit overflow-hidden whitespace-nowrap text-h4 text-white fw-bold transition-opacity" :class="{ 'opacity-0': isCollapsed }">
        Jetqor
      </div>
    </div>

    <!-- Navigation section -->
    <nav class="flex-1">
      <ul class="flex flex-col gap-2">
        <Motion
          v-for="item, index in navItems" :key="item.path" as="li"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: index * 0.1 }"
        >
          <RouterLink
            :to="item.path"
            class="flex items-center gap-4 rounded-xl py-3 text-white transition-colors transition-padding duration-300"
            :class="{
              'bg-main': isActive(item.path),
              'hover:bg-white/10 !text-grey': !isActive(item.path),
              'px-4': !isCollapsed,
              'px-2': isCollapsed,
            }"
          >
            <div
              class="size-6 flex-shrink-0" :class="[item.icon, {
                '!text-white !fill-white': isActive(item.path),
                'text-grey fill-grey': !isActive(item.path),
              }]"
            />
            <span class="overflow-hidden whitespace-nowrap body-large-medium transition-opacity duration-300" :class="{ 'opacity-0': isCollapsed }">{{ item.name }}</span>
          </RouterLink>
        </Motion>
      </ul>
    </nav>

    <!-- Logout button -->
    <Motion
      as="div" class="mt-auto border-t-2px border-grayscale-800 pt-4"
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: navItems.length * 0.1 }"
      @click="useAuth().logout"
    >
      <button
        class="w-full flex items-center gap-4 rounded-xl py-3 text-main transition-colors transition-padding duration-300 hover:bg-white/10"
        :class="{
          'px-4': !isCollapsed,
          'px-2': isCollapsed,
        }"
      >
        <div class="i-jq-logout size-6 flex-shrink-0 text-main" />
        <span class="overflow-hidden whitespace-nowrap body-large-medium transition-opacity duration-300" :class="{ 'opacity-0': isCollapsed }">Выйти</span>
      </button>
    </Motion>
  </Motion>
</template>

<style scoped>
.transition-width {
  transition-property: width;
}
</style>
