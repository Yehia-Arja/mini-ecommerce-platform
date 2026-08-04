FROM node:22-alpine AS base

WORKDIR /app

FROM base AS deps

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM deps AS build

COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM deps AS prune

RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=prune /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY backend/package.json ./
COPY backend/migrations ./migrations
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER node

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]