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
  REVIEWS: {
    LIST: { URL: "/api/reviews", KEY: "reviews-list" },
    CREATE: { URL: "/api/reviews", KEY: "reviews-create" },
  },
  ORDERS: {
    LIST: { URL: "/api/orders", KEY: "orders-list" },
    CREATE: { URL: "/api/orders", KEY: "orders-create" },
    UPDATE: { URL: "/api/orders", KEY: "orders-update" },
  },
  CATEGORIES: {
    LIST: { URL: "/api/categories", KEY: "categories-list" },
    CREATE: { URL: "/api/categories", KEY: "categories-create" },
    UPDATE: { URL: "/api/categories", KEY: "categories-update" },
    DELETE: { URL: "/api/categories", KEY: "categories-delete" },
  },
  PRODUCTS: {
    LIST: { URL: "/api/products", KEY: "products-list" },
    CREATE: { URL: "/api/products", KEY: "products-create" },
    UPDATE: { URL: "/api/products", KEY: "products-update" },
    DELETE: { URL: "/api/products", KEY: "products-delete" },
  },
};

