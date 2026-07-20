# syntax=docker/dockerfile:1

FROM public.ecr.aws/docker/library/node:22-alpine AS base
RUN apk add --no-cache curl ca-certificates
WORKDIR /app

FROM base AS deps
COPY api/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install

FROM deps AS build
COPY api/ .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY api/package*.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
