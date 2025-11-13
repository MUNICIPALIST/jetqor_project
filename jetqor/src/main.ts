import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { PiniaColada } from "@pinia/colada";
import { vMaska } from "maska/vue";
import { createPinia } from "pinia";
import { setupLayouts } from "virtual:generated-layouts";
import { createApp } from "vue";
import { createVfm } from "vue-final-modal";
import { createI18n } from "vue-i18n";
import { createRouter, createWebHistory } from "vue-router/auto";
import { routes } from "vue-router/auto-routes";
import App from "./App.vue";
import kz from "./locales/kz.json";

import ru from "./locales/ru.json";
import { authMiddleware } from "./middleware/auth";

import "vue-final-modal/style.css";
import "@unocss/reset/tailwind.css";
import "./styles/main.css";
import "uno.css";

const i18n = createI18n({
  locale: "ru",
  fallbackLocale: "ru",
  availableLocales: ["ru", "kz"],
  legacy: false,
  messages: {
    ru,
    kz,
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
});

// Add auth middleware
router.beforeEach(authMiddleware);

const pinia = createPinia();
const vfm = createVfm();

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(pinia);
app.use(PiniaColada);
app.use(autoAnimatePlugin);
app.use(vfm);
app.directive("maska", vMaska);
app.mount("#app");
