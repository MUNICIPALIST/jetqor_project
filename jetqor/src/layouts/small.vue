<script lang="ts" setup>
import Breadcrumbs from "~/components/Breadcrumbs.vue";

const smallName = ref("");
</script>

<template>
  <div class="size-full bg-background">
    <!-- <Breadcrumbs class="mb-4" :small-name="smallName" /> -->
    <RouterView @set-name="smallName = $event" />
  </div>
</template>

<style>
/* Add any necessary styles here */
</style>
