import { publicPaths } from '@/configs/routes';
import axios from 'axios';
import { runRedirectToLogin } from './utils/redirect';
import { CustomAxiosRequestConfig } from '@e-shop-app/packages/types';

export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api`,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// handle logout and prevent infinite loops
const handleLogout = () => {
  const currentPath = window.location.pathname;

  if (typeof window !== 'undefined' && !publicPaths.includes(currentPath)) {
    runRedirectToLogin();
  }
};

// handle adding a new access token to queued requests
const subscriberTokenRefresh = (cb: () => void) => {
  refreshSubscribers.push(cb);
};

// Execute queued requests after token refresh
// new requests that failed while refreshing the token will be retried
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

// Handle api requests
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Handle expired token and refresh token logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const requestPath = '/auth/refresh-token?accountType=user';

    const is401 = error.response?.status === 401;
    const isRetry = !!originalRequest?._retry;
    // const isAuthRequired = !!originalRequest?.requireAuth;

    if (
      is401 &&
      !isRetry &&
      !originalRequest.url?.includes(requestPath)
      // isAuthRequired
    ) {
      // prevent infinite loops
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscriberTokenRefresh(() => {
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post(requestPath);
        isRefreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
