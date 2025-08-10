# Backend Authentication Setup

## Что было исправлено и добавлено:

### ✅ **Обновленные файлы:**

#### 1. **`app/core/auth.py`** - Основная логика аутентификации
- ✅ Добавлены правильные импорты
- ✅ Pydantic модели для валидации
- ✅ Функции для работы с JWT токенами
- ✅ Функции для хеширования паролей
- ✅ Функции для аутентификации пользователей
- ✅ Функции для создания пользователей

#### 2. **`app/api/endpoints/auth.py`** - API эндпоинты
- ✅ Эндпоинт регистрации `/api/v1/auth/register`
- ✅ Эндпоинт входа `/api/v1/auth/login`
- ✅ Эндпоинт получения токена `/api/v1/auth/token`
- ✅ Эндпоинт получения профиля `/api/v1/auth/me`

#### 3. **`app/db/models/user.py`** - Модель пользователя
- ✅ Обновлена модель с правильными полями
- ✅ Добавлены ограничения nullable
- ✅ Добавлен метод __repr__

#### 4. **`requirements.txt`** - Зависимости
- ✅ Добавлены необходимые пакеты для JWT и хеширования

#### 5. **`app/main.py`** - Основное приложение
- ✅ Добавлен роутер аутентификации

## Что нужно сделать:

### 1. **Для локальной разработки (без Docker):**

#### Установить зависимости:
```bash
cd backend
pip install -r requirements.txt
```

**Примечание:** Если возникают проблемы с импортами `jose` или `passlib`, выполните:
```bash
# Удалить неправильный пакет jose (если установлен)
pip uninstall jose -y

# Установить правильные пакеты
pip install "python-jose[cryptography]" "passlib[bcrypt]" python-multipart
```

#### Создать миграцию для обновления таблицы пользователей:
```bash
# Из корневой директории проекта
source venv/bin/activate
alembic revision --autogenerate -m "update_user_model"
alembic upgrade head
```

### 2. **Для Docker (рекомендуется):**

#### Запустить с Docker:
```bash
# Из корневой директории проекта
./start_docker.sh
```

Или вручную:
```bash
# Остановить существующие контейнеры
docker-compose down

# Пересобрать образы
docker-compose build --no-cache

# Запустить приложение
docker-compose up -d

# Проверить логи
docker-compose logs -f api
```

### 3. **Настроить переменные окружения:**

#### Для локальной разработки:
Создайте файл `.env` в папке `backend/`:
```env
# Database
DATABASE_URL=postgresql+psycopg://postgres:3891123@localhost:5432/medical_application

# JWT Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### Для Docker:
Переменные окружения уже настроены в `docker-compose.yml`:
- `DATABASE_URL`: postgresql+psycopg://postgres:3891123@db:5432/medical_application
- `SECRET_KEY`: your-super-secret-key-change-this-in-production
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
- `ALLOWED_ORIGINS`: http://localhost:3000,http://127.0.0.1:3000

### 4. **Конфигурация уже обновлена:**
Файл `app/core/auth.py` уже настроен для использования переменных окружения.

## Доступные API эндпоинты:

### **Регистрация:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### **Вход (JSON):**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### **Вход (Form):**
```http
POST /api/v1/auth/token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password123
```

### **Получение профиля:**
```http
GET /api/v1/auth/me
Authorization: Bearer <your-jwt-token>
```

## Интеграция с Frontend:

### **В NextAuth Credentials провайдере:**
```typescript
Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      // Возвращаем пользователя для NextAuth
      return {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.email, // или другое поле для имени
        accessToken: data.access_token,
      }
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  }
})
```

## Тестирование:

### **1. Запустите backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### **2. Проверьте Swagger документацию:**
Откройте http://localhost:8000/docs

### **3. Протестируйте эндпоинты:**
```bash
# Регистрация
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Вход
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## Безопасность:

- ✅ Пароли хешируются с помощью bcrypt
- ✅ JWT токены с настраиваемым временем жизни
- ✅ Валидация данных с помощью Pydantic
- ✅ Проверка уникальности email
- ✅ Обработка ошибок

## Следующие шаги:

1. **Настройте переменные окружения**
2. **Запустите миграции**
3. **Протестируйте API**
4. **Интегрируйте с frontend NextAuth**
5. **Добавьте дополнительные поля в модель пользователя (имя, роль и т.д.)**
