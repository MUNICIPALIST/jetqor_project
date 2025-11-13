# 1. Используем официальный Node.js образ для сборки
FROM node:20-alpine AS builder

WORKDIR /app

# 2. Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 3. Устанавливаем pnpm
RUN npm install -g pnpm

# 4. Устанавливаем зависимости
RUN pnpm install

# 5. Копируем остальные файлы проекта
COPY . .

# 6. Собираем проект
RUN pnpm build

# 7. Используем nginx для отдачи статики
FROM nginx:alpine

# 8. Копируем собранные файлы в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 9. Копируем кастомный nginx.conf (если нужно)
# COPY nginx.conf /etc/nginx/nginx.conf

# 10. Открываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
