#!/bin/bash

# Скрипт для запуска приложения с Docker

echo "🚀 Запуск Medical Tests Application с Docker..."

# Остановить существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Удалить старые образы (опционально)
echo "🧹 Очистка старых образов..."
docker-compose build --no-cache

# Запустить приложение
echo "▶️ Запуск приложения..."
docker-compose up -d

# Ждать, пока база данных будет готова
echo "⏳ Ожидание готовности базы данных..."
sleep 10

# Проверить статус контейнеров
echo "📊 Статус контейнеров:"
docker-compose ps

# Показать логи API
echo "📝 Логи API (Ctrl+C для выхода):"
docker-compose logs -f api
