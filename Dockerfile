#stage 1 Build and Prepare App
# Pull node
FROM node:24-alpine AS builder
# Create working directory
WORKDIR /app

#Install git for build
RUN apk add --no-cache git

#Enable corepack and isntall pnpm
RUN corepack enable \
 && corepack prepare pnpm@9.0.0 --activate

# Copy dependency files first (better caching)
COPY package.json pnpm-lock.yaml ./
#Install dependencies
RUN pnpm install --frozen-lockfile

# Copy full application code into working directory
COPY . .

# Build Application
RUN pnpm run build

# stage 2 Move Build App To NGINX
# Pull nginx for angular hosting
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config into correct folder
COPY nginx.conf /etc/nginx/conf.d/default.conf
