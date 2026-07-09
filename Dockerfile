FROM node:24-alpine
USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN mkdir /pnpm
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate 
RUN pnpm config set global-bin-dir /pnpm/bin --global

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile && pnpm add -g typescript
COPY src/ ./src/
COPY tsconfig.json ./
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

EXPOSE 3000
ENV PORT 3000
LABEL org.opencontainers.image.source="https://github.com/aelithron/supernova-slack"
CMD ["node", "dist/index.js"]