import { ofetch } from "ofetch";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

const api = ofetch.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,

  async onRequest({ options }) {
    const headers =
      options.headers instanceof Headers
        ? options.headers
        : new Headers((options.headers as Record<string, string>) || {});

    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (isFormData) {
      headers.delete("Content-Type");
    } else if (!headers.has("Content-Type") && options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    options.headers = headers;
  },

  async onResponse({ response }) {
    if (
      response._data &&
      typeof response._data === "object" &&
      response._data.message?.includes("[ERROR]")
    ) {
      throw new Error(response._data.message);
    }
  },

  async onResponseError({ response }) {
    if (response.status === 403) {
      console.error("Auth error:", response._data);
      localStorage.removeItem("token");
      router.push("/login");
      useToasters().error("Сессия истекла, пожалуйста, войдите снова");
    }
  },
});

export default api;