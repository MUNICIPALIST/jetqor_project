<script lang="ts" setup>
import CardWithLogo from "~/features/login/components/CardWithLogo.vue";
import useAuth from "~/features/login/composables/useAuth";

const { auth, authForm } = useAuth();

async function handleSubmit() {
  await auth();
}
const disabled = computed(() => !authForm.value.email || !authForm.value.password);
</script>

<template>
  <div class="h-100vh flex items-center justify-center">
    <CardWithLogo>
      <div class="text-4.5 text-black fw-600">
        Войдите в свой аккаунт
      </div>

      <AppInput v-model="authForm.email" type="email" placeholder="Email" />
      <div class="flex flex-col gap-3">
        <AppInput v-model="authForm.password" type="password" placeholder="Пароль" />
        <!-- <div class="flex items-center justify-between">
          <div>Запомнить меня</div>
          <div>Забыли пароль</div>
        </div> -->
      </div>

      <BaseButton :disabled="disabled" class="h-14" @click="handleSubmit">
        Войти
      </BaseButton>
    </CardWithLogo>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: login
</route>
