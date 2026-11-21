import axios from "axios";

export const clientApi = axios.create({
  baseURL: "/api",          
  withCredentials: true,   
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

clientApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
        window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);