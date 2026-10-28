/**
 * Centralized API endpoints and Query Keys for the application.
 */

export const ENDPOINTS = {
  AUTH: {
    SIGNIN: { URL: "/api/auth/signin", KEY: "auth-signin" },
    SIGNUP: { URL: "/api/auth/signup", KEY: "auth-signup" },
    VERIFY: { URL: "/api/auth/verify", KEY: "auth-verify" },
    FORGOT_PASSWORD: { URL: "/api/auth/forgot-password", KEY: "auth-forgot-password" },
    RESET_PASSWORD: { URL: "/api/auth/reset-password", KEY: "auth-reset-password" },
    CHANGE_PASSWORD: { URL: "/api/auth/change-password", KEY: "auth-change-password" },
  },
};

