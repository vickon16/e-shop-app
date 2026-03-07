import { Routes } from '@/configs/routes';

let redirectToLogin = () => {
  window.location.href = Routes.auth.login;
};

export const setRedirectHandler = (handler: () => void) => {
  redirectToLogin = handler;
};

export const runRedirectToLogin = () => {
  redirectToLogin();
};
