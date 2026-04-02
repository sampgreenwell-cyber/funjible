FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules like bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install build dependencies for production dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]