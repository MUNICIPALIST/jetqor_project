<script lang="ts" setup>
import { format } from "@formkit/tempo";

const props = defineProps<{
  date?: string | Date;
}>();
const formattedDate = computed(() => {
  if (!props.date)
    return null;
  const date = new Date(props.date);
  return format(date, "D MMMM YYYY", "ru");
});
</script>

<template>
  <div v-if="formattedDate" class="rounded-6px bg-#FAFAFA px-10px py-7px">
    <span class="text-#00848C fw-600 leading-15px tracking-0.2px">{{ formattedDate }}</span>
  </div>
</template>

<style>

</style>
