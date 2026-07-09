FROM node:24-alpine
USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN mkdir /pnpm
RUN apk update && apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate 
RUN pnpm config set global-bin-dir /pnpm/bin --global

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm add -g typescript && pnpm add -g node-pre-gyp && pnpm install --frozen-lockfile 
COPY src/ ./src/
COPY tsconfig.json ./
RUN pnpm run build

EXPOSE 3000
ENV PORT 3000
LABEL org.opencontainers.image.source="https://github.com/aelithron/supernova-slack"
CMD ["node", "dist/index.js"]