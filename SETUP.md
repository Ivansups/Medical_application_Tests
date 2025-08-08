# Инструкции по настройке проекта

## Предварительные требования

### Для бэкенда
- Python 3.8+
- pip
- PostgreSQL (или SQLite для разработки)

### Для фронтенда
- Node.js 18+
- npm

## Пошаговая настройка

### 1. Клонирование и настройка окружения

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd Medical_application_Tests

# Создайте виртуальное окружение Python
python -m venv venv

# Активируйте виртуальное окружение
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
```

### 2. Настройка бэкенда

```bash
# Перейдите в папку бэкенда
cd backend

# Установите зависимости
pip install -r requirements.txt

# Настройте базу данных (если используете PostgreSQL)
# Создайте файл .env в папке backend:
echo "DATABASE_URL=postgresql://user:password@localhost/medical_tests" > .env

# Или для SQLite (по умолчанию):
echo "DATABASE_URL=sqlite:///./medical_tests.db" > .env

# Примените миграции
alembic upgrade head

# Запустите сервер разработки
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Настройка фронтенда

```bash
# Откройте новый терминал и перейдите в папку фронтенда
cd frontend

# Установите зависимости
npm install

# Создайте файл с переменными окружения
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Запустите сервер разработки
npm run dev
```

## Проверка работоспособности

### Проверка бэкенда
```bash
# Проверьте, что API отвечает
curl http://localhost:8000/
# Ожидаемый ответ: {"message": "Hello, Database is connected!"}

# Проверьте документацию API
# Откройте в браузере: http://localhost:8000/docs
```

### Проверка фронтенда
```bash
# Откройте в браузере: http://localhost:3000
# Вы должны увидеть интерфейс приложения
```

## Структура API для интеграции

### Основные эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/tests_all_tests` | Получить список всех тестов |
| GET | `/tests/{id}` | Получить тест по ID |
| POST | `/tests` | Создать новый тест |
| PUT | `/tests/{id}` | Обновить тест |
| DELETE | `/tests/{id}` | Удалить тест |

### Примеры запросов

#### Получение списка тестов
```javascript
const response = await fetch('http://localhost:8000/tests_all_tests');
const tests = await response.json();
```

#### Создание нового теста
```javascript
const response = await fetch('http://localhost:8000/tests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Название теста',
    description: 'Описание теста'
  })
});
const newTest = await response.json();
```

### Модели данных

```typescript
interface Test {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  duration_minutes: number;
}

interface TestCreate {
  title: string;
  description?: string;
}
```

## Настройка для продакшена

### Бэкенд
1. Измените `DATABASE_URL` на продакшен базу данных
2. Настройте CORS для домена фронтенда
3. Добавьте аутентификацию и авторизацию
4. Настройте логирование

### Фронтенд
1. Измените `NEXT_PUBLIC_API_URL` на продакшен URL API
2. Выполните сборку: `npm run build`
3. Запустите: `npm start`

## Решение проблем

### Проблемы с бэкендом

**Ошибка подключения к базе данных:**
```bash
# Проверьте DATABASE_URL в .env файле
# Убедитесь, что база данных запущена
# Проверьте права доступа пользователя
```

**Ошибка миграций:**
```bash
# Сбросьте миграции (только для разработки!)
alembic downgrade base
alembic upgrade head
```

### Проблемы с фронтендом

**Ошибка CORS:**
```bash
# Убедитесь, что бэкенд запущен
# Проверьте NEXT_PUBLIC_API_URL
# Добавьте CORS middleware в бэкенд
```

**Ошибка сборки:**
```bash
# Очистите кэш
rm -rf .next
npm run build
```

## Полезные команды

### Бэкенд
```bash
# Создать новую миграцию
alembic revision --autogenerate -m "Описание изменений"

# Применить миграции
alembic upgrade head

# Откатить миграцию
alembic downgrade -1

# Запустить тесты (если есть)
pytest
```

### Фронтенд
```bash
# Проверить типы TypeScript
npx tsc --noEmit

# Запустить линтер
npm run lint

# Очистить кэш Next.js
rm -rf .next
```

## Контакты

При возникновении проблем обращайтесь к команде разработки или создавайте issue в репозитории.
