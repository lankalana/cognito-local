FROM node:24-alpine AS builder
ARG MISE_VERSION=v2026.7.5
RUN wget "https://github.com/jdx/mise/releases/download/${MISE_VERSION}/mise-${MISE_VERSION}-linux-x64-musl" -O /usr/local/bin/mise \
	&& chmod +x /usr/local/bin/mise \
	&& mise use --global aube

WORKDIR /app

# dependencies
COPY package.json aube-lock.yaml vite.config.ts ./
RUN mise exec -- aube ci

# library code
COPY src src

# bundle
RUN mise exec -- aube run build



FROM node:24-alpine
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
