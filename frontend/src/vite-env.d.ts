/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEV_API_PROXY: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_DEFAULT_MAP_LAT: string;
  readonly VITE_DEFAULT_MAP_LNG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
