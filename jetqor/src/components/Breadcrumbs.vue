<script lang="ts" setup>
import { useBreadcrumbs } from "~/composables/useBreadcrumbs";

const props = defineProps<{
  smallName?: string;
}>();
const { breadcrumbs } = useBreadcrumbs();
</script>

<template>
  <nav aria-label="Навигация">
    <ol class="m-0 flex list-none gap-12px p-0">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
        <template v-if="index < breadcrumbs.length - 1">
          <RouterLink
            :to="crumb.path"
            class="text-[#ABACAE] no-underline hover:text-black"
          >
            {{ crumb.label }}
          </RouterLink>
          <div class="ml-2.5">
            <div class="i-jq-chevron-right size-10px text-#ABACAE" />
          </div>
        </template>
        <!-- Используем пользовательское имя, если оно предоставлено, иначе используем label из хлебной крошки -->
        <span v-else class="text-black">{{ props.smallName || crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>
