# Wybierz Node.js jako bazowy obraz
FROM node:22-alpine as base
WORKDIR /app

FROM base as deps 
WORKDIR /app
# Skopiuj package.json i package-lock.json (jeśli istnieje)
COPY package*.json ./
# Zainstaluj zależności
RUN npm install
# Skopiuj resztę kodu aplikacji
COPY . .




# ===== Development stage =====
FROM deps AS development
WORKDIR /app
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]




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



