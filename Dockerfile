# Stage 1: Build frontend con Node
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile 2>/dev/null || npm install --include=dev
COPY . .
RUN npm run build

# Stage 2: Runtime con PHP
FROM php:8.2-cli
WORKDIR /app

# Extensiones necesarias
RUN docker-php-ext-install pdo_mysql mbstring

# Copiar build frontend
COPY --from=frontend-build /app/dist ./dist

# Copiar backend PHP
COPY backend ./backend
COPY server.php ./

EXPOSE 10000

CMD ["php", "-S", "0.0.0.0:10000", "server.php"]
