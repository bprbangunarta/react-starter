# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
# Internal admin app: closed to search engines by default. Open with: docker build --build-arg ALLOW_INDEXING=true .
ARG ALLOW_INDEXING=false
ENV ALLOW_INDEXING=$ALLOW_INDEXING
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ARG ALLOW_INDEXING=false
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN if [ "$ALLOW_INDEXING" = "true" ]; then sed -i '/X-Robots-Tag/d' /etc/nginx/security-headers.conf; fi
EXPOSE 80
