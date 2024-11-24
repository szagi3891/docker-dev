# Wybierz Node.js jako bazowy obraz
FROM node:22-alpine AS base
WORKDIR /app


FROM base AS deps 
WORKDIR /app
# Skopiuj package.json i package-lock.json (jeśli istnieje)
COPY . .
RUN npm install
#żeby warstwa się od razu nie wyłączyła
# CMD ["tail", "-f", "/dev/null"]
CMD ["sh", "-c", "while true; do sleep 30; done"]


# ===== Development stage =====
FROM deps AS development
WORKDIR /app
ENV NODE_ENV=development
CMD ["npx", "next", "dev", "--turbopack"]


FROM deps AS production-build
WORKDIR /app
# Zbuduj aplikację
RUN npm run build


# ===== Production stage =====
FROM base AS production
WORKDIR /app
COPY --from=production-build /app/.next/standalone ./
COPY --from=production-build /app/.next/static ./.next/static
# Ustaw zmienne środowiskowe dla trybu prod
ENV NODE_ENV=production
CMD ["node", "server.js"]
