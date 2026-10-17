import axios from "axios";
import { products } from "../data/products";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const api = axios.create({
  baseURL,
  timeout: 7000,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productService = {
  async list(params = {}) {
    if (baseURL) {
      try {
        const { data } = await api.get("/products", { params });
        if (data.products?.length) return data.products;
      } catch (error) {
        console.warn("Backend catalog unavailable; showing local demo catalog.", error.message);
      }
    }
    let result = [...products];
    if (params.search) result = result.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(params.search.toLowerCase()));
    if (params.category && params.category !== "All products") result = result.filter(p => p.category === params.category);
    if (params.sort === "price-low") result.sort((a,b) => a.price-b.price);
    if (params.sort === "price-high") result.sort((a,b) => b.price-a.price);
    if (params.sort === "rating") result.sort((a,b) => b.rating-a.rating);
    return result;
  },
  async get(id) {
    if (baseURL) {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (data.product) return data.product;
      } catch (error) {
        console.warn("Using demo product data.", error.message);
      }
    }
    return products.find(p => p.id === id || p.slug === id) || null;
  }
};

export const authService = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me")
};

export const cartService = {
  get: () => api.get("/cart"),
  add: (item) => api.post("/cart/add", item),
  update: (productId, quantity) => api.put("/cart/update", { productId, quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart")
};

export const addressService = {
  list: () => api.get("/addresses"),
  add: (address) => api.post("/addresses", address),
  update: (id, address) => api.patch(`/addresses/${id}`, address),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`)
};

export const orderService = {
  create: (payload) => api.post("/orders", payload),
  mine: () => api.get("/orders/my-orders"),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`)
};

export const paymentService = {
  createOrder: (payload) => api.post("/payments/create-order", payload),
  verify: (payload) => api.post("/payments/verify", payload)
};

export const adminService = {
  dashboard: () => api.get("/admin/dashboard"),
  products: (params) => api.get("/admin/products", { params }),
  addProduct: (product) => api.post("/admin/products", product),
  updateProduct: (id, product) => api.patch(`/admin/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  orders: () => api.get("/admin/orders"),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  users: () => api.get("/admin/users")
};
