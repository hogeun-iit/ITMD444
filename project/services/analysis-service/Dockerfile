FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json tsconfig.build.json ./
RUN npx prisma generate && npx tsc -p tsconfig.build.json && cp -r src/generated dist/generated

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
