#!/bin/bash

echo "🚀 Проверка работоспособности Medical Tests App"
echo "================================================"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

echo "✅ Docker и Docker Compose установлены"

echo "🛑 Остановка существующих контейнеров..."
docker-compose down -v

echo "🚀 Запуск сервисов..."
docker-compose up -d

echo "⏳ Ожидание запуска базы данных..."
sleep 10

echo "🔍 Проверка базы данных..."
if docker-compose exec db pg_isready -U postgres; then
    echo "✅ База данных работает"
else
    echo "❌ База данных не отвечает"
    docker-compose logs db
    exit 1
fi

echo "⏳ Ожидание запуска API..."
sleep 15

echo "🔍 Проверка API..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ API работает"
    echo "📋 Ответ API:"
    curl -s http://localhost:8000/ | jq .
else
    echo "❌ API не отвечает"
    docker-compose logs api
    exit 1
fi

echo "🔍 Проверка эндпоинта тестов..."
if curl -f http://localhost:8000/api/v1/tests_all_tests > /dev/null 2>&1; then
    echo "✅ Эндпоинт тестов работает"
    echo "📋 Список тестов:"
    curl -s http://localhost:8000/api/v1/tests_all_tests | jq .
else
    echo "❌ Эндпоинт тестов не отвечает"
    docker-compose logs api
    exit 1
fi

echo "⏳ Ожидание запуска фронтенда..."
sleep 10

echo "🔍 Проверка фронтенда..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Фронтенд работает"
else
    echo "❌ Фронтенд не отвечает"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 Все сервисы работают!"
echo "========================="
echo "🌐 Фронтенд: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️  База данных: localhost:5432"
echo ""
echo "Для остановки: docker-compose down"
echo "Для просмотра логов: docker-compose logs -f"
