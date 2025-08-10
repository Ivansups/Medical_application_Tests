# Docker Authentication Setup

## ✅ **Проблема с импортами решена!**

Все необходимые пакеты установлены и работают корректно:
- ✅ `python-jose[cryptography]` - для JWT токенов
- ✅ `passlib[bcrypt]` - для хеширования паролей
- ✅ `bcrypt` - для шифрования
- ✅ `cryptography` - для криптографических операций

## 🚀 **Быстрый запуск с Docker:**

### 1. **Запустить приложение:**
```bash
# Из корневой директории проекта
./start_docker.sh
```

### 2. **Или вручную:**
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

## 📊 **Статус системы:**

### ✅ **Что работает:**
- **Хеширование паролей** - bcrypt с солью
- **JWT токены** - создание и валидация
- **Подключение к БД** - PostgreSQL через Docker
- **Создание пользователей** - с проверкой уникальности
- **API эндпоинты** - регистрация, вход, профиль
- **Миграции** - автоматическое обновление схемы

### 🔧 **Конфигурация Docker:**
- **База данных:** PostgreSQL 15 в контейнере
- **API:** FastAPI с автоперезагрузкой
- **Переменные окружения:** настроены в docker-compose.yml
- **Порты:** 5432 (БД), 8000 (API)

## 🌐 **Доступные эндпоинты:**

После запуска Docker, API будет доступен по адресу: `http://localhost:8000`

### **Аутентификация:**
- `POST /api/v1/auth/register` - регистрация
- `POST /api/v1/auth/login` - вход через JSON
- `POST /api/v1/auth/token` - вход через форму
- `GET /api/v1/auth/me` - получение профиля

### **Документация API:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔐 **Безопасность:**

- ✅ **Пароли хешируются** с помощью bcrypt
- ✅ **JWT токены** с настраиваемым временем жизни
- ✅ **Валидация данных** с помощью Pydantic
- ✅ **Проверка уникальности** email
- ✅ **CORS настройки** для frontend

## 🧪 **Тестирование:**

### **Запустить тесты:**
```bash
cd backend
python test_auth.py
```

### **Ожидаемый результат:**
```
🎉 Все тесты пройдены! Система аутентификации работает корректно.
```

## 🔄 **Интеграция с Frontend:**

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
      
      return {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.email,
        accessToken: data.access_token,
      }
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  }
})
```

## 📝 **Переменные окружения:**

Все переменные уже настроены в `docker-compose.yml`:

```yaml
environment:
  DATABASE_URL: postgresql+psycopg://postgres:3891123@db:5432/medical_application
  SECRET_KEY: your-super-secret-key-change-this-in-production
  ALGORITHM: HS256
  ACCESS_TOKEN_EXPIRE_MINUTES: 30
  ALLOWED_ORIGINS: http://localhost:3000,http://127.0.0.1:3000
```

## 🎯 **Следующие шаги:**

1. **Запустите Docker:** `./start_docker.sh`
2. **Проверьте API:** `http://localhost:8000/docs`
3. **Интегрируйте с frontend** NextAuth
4. **Настройте OAuth провайдеры** (Google, GitHub)
5. **Добавьте дополнительные поля** в модель пользователя

## 🆘 **Устранение неполадок:**

### **Если Docker не запускается:**
```bash
# Проверить статус контейнеров
docker-compose ps

# Посмотреть логи
docker-compose logs api

# Пересобрать образы
docker-compose build --no-cache
```

### **Если база данных недоступна:**
```bash
# Проверить подключение к БД
docker-compose exec api python -c "from app.db.session import get_db; print('DB OK')"
```

### **Если миграции не работают:**
```bash
# Запустить миграции вручную
docker-compose exec api alembic upgrade head
```

---

**🎉 Система аутентификации готова к использованию с Docker!**
