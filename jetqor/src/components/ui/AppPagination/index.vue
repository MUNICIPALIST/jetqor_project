<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "update:currentPage": [page: number];
}>();

const pages = computed(() => {
  const result = [];
  const maxVisiblePages = 5;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(1, props.currentPage - halfVisiblePages);
  const endPage = Math.min(props.totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    result.push(i);
  }

  return result;
});

function changePage(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit("update:currentPage", page);
  }
}
</script>

<template>
  <div class="my-4 flex items-center justify-center gap-2">
    <button
      class="rounded bg-gray-100 px-3 py-2 disabled:cursor-not-allowed hover:bg-gray-200 disabled:opacity-50"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      <i class="i-carbon-chevron-left" />
    </button>

    <template v-for="page in pages" :key="page">
      <button
        class="min-w-[40px] rounded px-3 py-2"
        :class="page === currentPage ? 'bg-main text-white' : 'bg-gray-100 hover:bg-gray-200'"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="rounded bg-gray-100 px-3 py-2 disabled:cursor-not-allowed hover:bg-gray-200 disabled:opacity-50"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      <i class="i-carbon-chevron-right" />
    </button>
  </div>
</template>
