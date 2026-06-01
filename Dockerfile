FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY backend/package.json backend/package.json
COPY web/package.json web/package.json

RUN npm ci

COPY backend backend
COPY web web

ENV VITE_API_URL=""
RUN npm run build
RUN npm prune --omit=dev --workspaces

FROM node:24-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/data/app.sqlite

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend backend
COPY --from=build /app/web/dist web/dist

EXPOSE 8080

CMD ["npm", "--workspace", "backend", "run", "start"]
