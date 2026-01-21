FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY games/trivia/package.json ./games/trivia/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source files
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
COPY games/trivia ./games/trivia

# Build
RUN pnpm --filter @game/shared build
RUN pnpm --filter @game/trivia build
RUN pnpm --filter @game/server build

# Expose port
EXPOSE 10000

# Start server
CMD ["node", "packages/server/dist/index.js"]
