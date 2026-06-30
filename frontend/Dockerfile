# --- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* variables are baked in at build time. Override with --build-arg.
ARG VITE_API_BASE_URL=""
ARG VITE_USE_MOCKS="false"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_USE_MOCKS=${VITE_USE_MOCKS}

RUN npm run build

# --- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
