FROM node:26-alpine
USER root
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN mkdir /pnpm
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@11.3.0
RUN pnpm config set global-bin-dir /pnpm/bin --global

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json rollup.config.ts ./
RUN pnpm install --frozen-lockfile && pnpm add -g typescript
COPY src/ ./src/
COPY huddles/ ./huddles/
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build
RUN pnpm run bundle-chime

#EXPOSE 3000
#ENV PORT 3000
LABEL org.opencontainers.image.source="https://github.com/aelithron/supernova-slack"
CMD ["node", "/app/dist/index.js"]