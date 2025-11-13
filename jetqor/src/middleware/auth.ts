import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const token = localStorage.getItem("token");
  const isLoginPage = to.path === "/login";

  if (!token && !isLoginPage) {
    // No token and not on login page - redirect to login
    return next("/login");
  }

  if (token && isLoginPage) {
    // Has token and trying to access login page - redirect to home
    return next("/");
  }

  // In all other cases, proceed normally
  next();
}
