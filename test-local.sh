#!/bin/bash

echo "🚀 Проверка локальной установки Medical Tests App"
echo "================================================="

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не установлен"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

echo "✅ Python3, Node.js и npm установлены"

echo "🔍 Проверка бэкенда..."
cd backend

if [ ! -d "../venv" ]; then
    echo "📦 Создание виртуального окружения..."
    cd ..
    python3 -m venv venv
    cd backend
fi

source ../venv/bin/activate

echo "📦 Установка зависимостей бэкенда..."
pip install -r requirements.txt

echo "🔍 Проверка импортов бэкенда..."
python3 -c "
try:
    from app.main import app
    from app.core.config import settings
    print('✅ Импорты бэкенда работают')
except Exception as e:
    print(f'❌ Ошибка импорта: {e}')
    exit(1)
"

cd ..

echo "🔍 Проверка фронтенда..."
cd frontend

echo "📦 Установка зависимостей фронтенда..."
npm install

echo "🔍 Проверка сборки фронтенда..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Сборка фронтенда работает"
else
    echo "❌ Ошибка сборки фронтенда"
    exit 1
fi

cd ..

echo ""
echo "🎉 Локальная установка готова!"
echo "=============================="
echo "Для запуска бэкенда:"
echo "  cd backend"
echo "  source ../venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Для запуска фронтенда (новый терминал):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Или используйте Docker:"
echo "  docker-compose up -d"
