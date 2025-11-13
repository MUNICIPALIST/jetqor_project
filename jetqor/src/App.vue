<script setup lang="ts">
import { PiniaColadaDevtools } from "@pinia/colada-devtools";
import { ModalsContainer } from "vue-final-modal";
import { toast, Toaster } from "vue-sonner";
import AppHeader from "~/components/ui/AppHeader.vue";
import TheSidebar from "~/components/ui/TheSidebar.vue";
import { useUserStore } from "./features/user/stores/user";
onBeforeMount(() => {
  useUserStore();
});
</script>

<template>
  <main font-sans class="h-full min-h-screen w-full">
    <RouterView />
    <ModalsContainer />
    <AppHeader v-if="$route.path !== '/login'" />
    <TheSidebar v-if="$route.path !== '/login'" />
    <Toaster rich-colors position="top-right" />
    <PiniaColadaDevtools />
  </main>
</template>

<style>
* {
  overscroll-behavior-y: none;
}
</style>
