FROM node:20-slim
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files and patches (required by pnpm for patched packages)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy all source files
COPY . .

# Build the application (Vite frontend + esbuild server)
RUN pnpm build

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

# Run migrations then start the server
CMD sh -c "node scripts/migrate.mjs && node dist/index.js"
