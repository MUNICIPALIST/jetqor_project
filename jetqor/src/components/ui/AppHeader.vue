<script lang="ts" setup>
// import { Motion } from "@vueuse/motion"; // Временно отключено
import { useFixedHeader } from "vue-use-fixed-header";
import AppButton from "~/components/ui/AppButton/index.vue";
import { getUser } from "~/features/user/queries/user";

const headerRef = ref(null);
const { styles } = useFixedHeader(headerRef);
const { data: user } = getUser();
</script>

<template>
  <div
    ref="headerRef"
    class="fixed left-0 top-0 h-100px w-full flex items-center justify-between bg-white py-20px pl-30 pr-20px"
    :style="styles"
  >
    <div class="h-36px flex flex-col justify-between">
      <Motion
        as="div" class="w-fit text-grey fw-500 leading-none"
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.1 }"
      >
        Добро пожаловать
      </Motion>
      <Motion
        as="div" class="w-fit text-18px text-black fw-600 leading-none"
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2 }"
      >
        {{ user?.name }}
      </Motion>
    </div>

    <div class="flex gap-x-6">
      <Motion
        as="div"
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.3 }"
      >
        <AppButton icon="i-jq-notification" size="icon" />
      </Motion>
      <!-- <Motion
        as="div"
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.4 }"
      >
        <AppButton show-arrow>
          RU
        </AppButton>
      </Motion> -->
      <Motion
        as="div"
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.5 }"
        @click="$router.push('/settings/profile')"
      >
        <AppButton
          show-arrow
          :avatar="{
            src: 'https://avatars.githubusercontent.com?v=4',
            fallback: 'НВ',
          }"
          size="lg"
          :subtitle="user?.role === 'administrator' ? 'Администратор' : user?.role === 'manager' ? 'Менеджер' : 'Клиент'"
        >
          {{ user?.email }}
        </AppButton>
      </Motion>
    </div>
  </div>
</template>

<style>

</style>
