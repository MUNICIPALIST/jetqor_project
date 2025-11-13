<script lang="ts" setup>

</script>

<template>
  <div class="flex flex-col items-center justify-center gap-10">
    <div class="size-40">
      <img src="/logo-color.svg" alt="logo" class="h-full object-contain">
    </div>

    <div class="min-w-600px flex flex-col gap-6 border-1 border-grayscale-200 rounded-4 bg-white p6">
      <slot />
    </div>
  </div>
</template>

<style>

</style>
