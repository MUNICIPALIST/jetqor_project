<script setup lang="ts">
// import { Motion } from "@vueuse/motion"; // Временно отключено
import SettingsSidebar from "~/components/settings/SettingsSidebar.vue";
import { getUser } from "~/features/user/queries/user";

const { data: user } = getUser();
</script>

<template>
  <main>
    <div class="grid grid-cols-[300px_1fr] h-full min-h-screen gap-4 bg-background p-4 pl-30 pt-30">
      <div class="w-full space-y-4">
        <Motion
          as="div"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.5 }"
          class="gap-4 rounded-3 bg-white p3"
        >
          <AppButton
            show-arrow
            :avatar="{
              src: 'https://avatars.githubusercontent.com?v=4',
              fallback: 'НВ',
            }"
            size="lg"
            subtitle="Администратор"
            class="w-full"
            variant="ghost"
          >
            <span class="w-40 truncate">{{ user?.email }}</span>
          </AppButton>
        </Motion>
        <SettingsSidebar />
      </div>
      <div class="h-fit w-full rounded-4 p-4">
        <RouterView />
      </div>
    </div>
  </main>
</template>
