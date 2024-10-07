FROM node:20-alpine AS builder
WORKDIR /app

# dependencies
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# library code
COPY src src

# bundle
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/lib .

# bindings
ARG port=9229
ENV PORT=$port
EXPOSE $PORT
ENV HOST=0.0.0.0
VOLUME /app/.cognito

ENTRYPOINT ["node", "/app/start.js"]
HEALTHCHECK --interval=5m --timeout=5s --start-period=30s --start-interval=5s --retries=5 \
	CMD wget -q --tries=1 --spider "http://$HOST:$PORT/health" || exit 1
