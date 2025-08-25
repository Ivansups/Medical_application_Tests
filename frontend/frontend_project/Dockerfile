FROM node:21-alpine

WORKDIR /app

COPY ../../package*.json ./

# Устанавливаем все зависимости (включая dev-зависимости для сборки)
RUN npm install

COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]