import "server-only";           
import axios from "axios";
import { cookies } from "next/headers";

// Axios instance dành cho server-side (API routes) gọi NestJS backend
export const serverApi = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

serverApi.interceptors.request.use(async (config) => {
  const token = (await cookies()).get("access_token")?.value;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});