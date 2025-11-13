<route lang="yaml">
meta:
  layout: settings
</route>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  router.replace("/settings/profile");
});
</script>

<template>
  <RouterView />
</template>
