FROM node:22-bookworm-slim AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sla-frontend/package.json ./sla-frontend/package.json
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm --filter sla-frontend build

FROM nginx:1.29-alpine3.22
COPY --from=build /app/sla-frontend/dist /usr/share/nginx/html
COPY sla-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
