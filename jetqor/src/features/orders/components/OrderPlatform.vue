<script lang="ts" setup>
interface Props {
  platform: string;
}

const props = withDefaults(defineProps<Props>(), {
  platform: "",
});

const platformLogo = computed(() => {
  switch (props.platform.toLowerCase()) {
    case "wildberries":
      return "/platforms/wildberries.svg";
    case "ozon":
      return "/platforms/ozon.svg";
    case "kaspi":
      return "/platforms/kaspi.svg";
    default:
      return "";
  }
});
</script>

<template>
  <div class="h-full w-22.5 gap-2 rounded bg-grayscale-100 p1">
    <img :src="platformLogo" alt="Platform Logo" class="size-full object-contain object-center">
  </div>
</template>
