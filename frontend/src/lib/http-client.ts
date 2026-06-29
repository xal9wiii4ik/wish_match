import axios, { type AxiosInstance } from "axios";

import { env_config } from "@/config/env";

import { normalize_error } from "./api-error";
import { token_storage } from "./token-storage";

function create_http_client(): AxiosInstance {
  const instance = axios.create({
    baseURL: `${env_config.api_base_url}/v1`,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  instance.interceptors.request.use((config) => {
    const token = token_storage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = normalize_error(error);
      if (normalized.status === 401) {
        token_storage.clear();
      }
      return Promise.reject(normalized);
    }
  );

  return instance;
}

export const http_client = create_http_client();
