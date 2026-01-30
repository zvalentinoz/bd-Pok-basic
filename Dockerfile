# Install dependencies only when needed
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Habilitar Corepack para Yarn 4
RUN corepack enable && corepack prepare yarn@stable --activate

# Instalar dependencias
RUN yarn install --immutable

# Build the app with cache dependencies
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./

# Copiar código fuente
COPY . .

# Habilitar Corepack
RUN corepack enable

# Build
RUN yarn build

# Production image
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Habilitar Corepack
RUN corepack enable && corepack prepare yarn@stable --activate

# Instalar solo dependencias de producción
RUN yarn workspaces focus --production

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Puerto (aunque Render lo asigna dinámicamente)
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]