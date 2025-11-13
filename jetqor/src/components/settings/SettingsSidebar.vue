<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const menuItems = [
  {
    title: "Личные данные",
    icon: "i-jq-user",
    to: "/settings/profile",
  },
  {
    title: "Сменить пароль",
    icon: "i-jq-lock",
    to: "/settings/password",
  },
  {
    title: "API ключи",
    icon: "i-jq-home-outline",
    to: "/settings/api",
  },
];
</script>

<template>
  <nav class="h-full w-full rounded-4 bg-grayscale-50 p-4">
    <div class="flex flex-col gap-4">
      <router-link
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-3 px-3 py-4 transition-colors"
        :class="[
          route.path === item.to
            ? 'bg-main text-white'
            : 'text-grey hover:bg-grayscale-100',
        ]"
      >
        <div class="text-xl" :class="item.icon" />
        <span
          class="text-16px leading-1.4rem tracking-1.25%" :class="[
            route.path === item.to
              ? 'font-700'
              : 'font-500',
          ]"
        >
          {{ item.title }}
        </span>
      </router-link>
    </div>
  </nav>
</template>
