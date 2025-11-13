<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";
import { computed } from "vue";
import useUser from "~/features/user/composables/useUser";

const props = defineProps<{
  status: string;
  onAddProducts: () => void;
  onChangeStatus: () => void;
}>();

// Define possible statuses
const STATUSES = {
  CREATED: "created",
  APPROVED: "approved",
  COMPLETED: "completed",
};

// Map component statuses to display names
const STATUS_LABELS = {
  [STATUSES.CREATED]: "В ожидании",
  [STATUSES.APPROVED]: "В процессе",
  [STATUSES.COMPLETED]: "Выполнено",
};

// If status is approved, everything is completed
const isAllCompleted = computed(() =>
  props.status === STATUSES.APPROVED || props.status === STATUSES.COMPLETED,
);

// Calculate visual state for each step based on current status
const stateCreated = computed(() => {
  if (isAllCompleted.value) {
    return { active: false, completed: true, text: "Завершено" };
  }
  else if (props.status === STATUSES.CREATED) {
    return { active: true, completed: false, text: STATUS_LABELS[STATUSES.CREATED] };
  }
  else {
    return { active: false, completed: true, text: "Завершено" };
  }
});

const stateApproved = computed(() => {
  if (isAllCompleted.value) {
    return { active: true, completed: true, text: STATUS_LABELS[STATUSES.APPROVED] };
  }
  else if (props.status === STATUSES.CREATED) {
    return { active: false, completed: false, text: STATUS_LABELS[STATUSES.APPROVED] };
  }
  else {
    return { active: false, completed: true, text: "Завершено" };
  }
});

const stateCompleted = computed(() => {
  if (isAllCompleted.value) {
    return { active: true, completed: true, text: STATUS_LABELS[STATUSES.COMPLETED] };
  }
  else {
    return { active: false, completed: false, text: STATUS_LABELS[STATUSES.COMPLETED] };
  }
});

// Button text and disabled states
const createdButtonText = computed(() =>
  props.status === STATUSES.CREATED ? "Добавить товары" : "Завершено",
);

const approvedButtonText = computed(() => {
  if (props.status === STATUSES.CREATED)
    return "В ожидании";
  return "Завершено";
});
const { user } = useUser();
const isClient = computed(() => user.value?.role === "client");
</script>

<template>
  <div class="flex justify-between px-16">
    <!-- Created/Waiting status -->
    <div class="flex flex-col items-center gap-4">
      <div
        class="size-14 flex items-center justify-center rounded-lg p2"
        :class="[
          stateCreated.completed ? 'bg-green-50' : 'bg-grayscale-100',
        ]"
      >
        <span
          class="i-jq-clock size-full"
          :class="[
            stateCreated.completed ? 'text-green' : stateCreated.active ? 'text-main' : 'text-main opacity-40',
          ]"
        />
      </div>
      <div
        :class="[
          stateCreated.active ? 'font-semibold' : 'text-sm text-second font-medium',
        ]"
      >
        {{ stateCreated.text }}
      </div>
      <BaseButton
        v-if="!isClient"
        variant="primary"
        :disabled="props.status !== STATUSES.CREATED"
        @click="onAddProducts"
      >
        {{ createdButtonText }}
      </BaseButton>
    </div>

    <div
      class="mt-7 flex-1 border-t-2 border-dashed" :class="[
        stateCreated.completed ? 'border-green-300' : 'border-grayscale-300',
      ]"
    />

    <!-- Approved/In Progress status -->
    <div class="flex flex-col items-center gap-4">
      <div
        class="size-14 flex items-center justify-center rounded-lg p2"
        :class="[
          stateApproved.completed ? 'bg-green-50' : 'bg-grayscale-100',
        ]"
      >
        <span
          class="i-jq-category size-full"
          :class="[
            stateApproved.completed ? 'text-green' : stateApproved.active ? 'text-main' : 'text-second',
          ]"
        />
      </div>
      <div
        :class="[
          stateApproved.active ? 'font-semibold' : 'text-sm text-second font-medium',
        ]"
      >
        {{ stateApproved.text }}
      </div>
      <BaseButton
        v-if="!isClient"
        variant="primary"
        :disabled="true"
        @click="onChangeStatus"
      >
        {{ approvedButtonText }}
      </BaseButton>
    </div>

    <div
      class="mt-7 flex-1 border-t-2 border-dashed" :class="[
        stateApproved.completed ? 'border-green-300' : 'border-grayscale-200',
      ]"
    />

    <!-- Completed status -->
    <div class="flex flex-col items-center gap-4">
      <div
        class="size-14 flex items-center justify-center rounded-lg p2"
        :class="[
          stateCompleted.completed ? 'bg-green-50' : 'bg-grayscale-100',
        ]"
      >
        <span
          class="i-jq-tick size-full"
          :class="[
            stateCompleted.completed ? 'text-green' : 'text-second',
          ]"
        />
      </div>
      <div
        :class="[
          stateCompleted.active ? 'font-semibold' : 'text-sm text-second font-medium',
        ]"
      >
        {{ stateCompleted.text }}
      </div>
      <BaseButton v-if="!isClient" variant="secondary" disabled>
        {{ isAllCompleted ? 'Завершено' : 'В ожидании' }}
      </BaseButton>
    </div>
  </div>
</template>
