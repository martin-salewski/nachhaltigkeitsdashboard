FROM node:22-slim AS builder
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc -p tsconfig.build.json && cp -r src/drizzle/migrations dist/drizzle/

FROM node:22-slim
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
