FROM hub.nexdev.net/base/node:20.18-alpine-25h1 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn yarn --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM deps AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build

EXPOSE 5000
ENV PORT=5000

CMD ["node", "build/index.js"]


