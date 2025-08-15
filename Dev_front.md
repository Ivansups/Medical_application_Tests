## Фронтенд разработчику: руководство и учебник

Next.js (App Router) + NextAuth + Prisma. Этот файл — не просто инструкции, а учебник с примерами и практикой интеграции с нашим FastAPI бэкендом.

### Технологии
- Next.js 14 (app/ directory)
- TypeScript
- NextAuth (JWT strategy)
- Prisma (для пользовательских данных фронта)

### Окружение
Создай `.env` в `frontend/frontend_project` на основе `.env.example`:
```
NEXTAUTH_SECRET=dev-secret-change-me
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medical_application
```

Генерация Prisma Client (если используешь Prisma во фронте):
```
cd frontend/frontend_project
npx prisma generate
```

### Базовый клиент API
Используй единый префикс `/api/v1` к бэкенду. Пример клиента (серверные действия/Server Actions):
```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
export const API_V1 = `${API_BASE_URL}/api/v1`

export async function apiGet(path: string, init?: RequestInit) {
  const res = await fetch(`${API_V1}${path}`, { cache: 'no-store', ...init })
  if (!res.ok) throw new Error((await res.json()).detail ?? `HTTP ${res.status}`)
  return res.json()
}

export async function apiJson(path: string, method: 'POST'|'PUT'|'DELETE', body?: unknown, init?: RequestInit) {
  const res = await fetch(`${API_V1}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error((await res.json()).detail ?? `HTTP ${res.status}`)
  return res.json()
}
```

Middleware для подстановки Bearer из сессии:
```ts
// app/api/_utils/fetchWithAuth.ts
import { auth } from '@/app/auth'

export async function fetchWithAuth(input: string, init?: RequestInit) {
  const session = await auth()
  const token = (session as any)?.accessToken
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
```

### Тесты: клиентские функции
```ts
import { apiGet, apiJson } from '@/lib/apiClient'

export const getAllTests = () => apiGet('/tests')
export const getTestById = (id: string) => apiGet(`/tests/${id}`)
export const createTest = (payload: any) => apiJson('/tests', 'POST', payload)
export const updateTest = (id: string, payload: any) => apiJson(`/tests/${id}`, 'PUT', payload)
export const deleteTest = (id: string) => apiJson(`/tests/${id}`, 'DELETE')
export const deleteAllTests = () => apiJson('/tests/', 'DELETE')
```

### Аутентификация (Credentials) через бэкенд
Добавь провайдер Credentials в `app/auth.ts`, который дергает наш `/api/v1/auth/login`:
```ts
import Credentials from 'next-auth/providers/credentials'

providers: [
  Credentials({
    name: 'Email/Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      })
      if (!res.ok) return null
      const data = await res.json()
      // Ожидаем { access_token, token_type }
      return { id: credentials.email, email: credentials.email, accessToken: data.access_token }
    },
  }),
]
```

Альтернативно — логин через локальный API-роут-прокси:
```ts
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
```

И расширь коллбеки, чтобы класть `accessToken` в JWT/сессию:
```ts
callbacks: {
  async jwt({ token, user }) {
    if (user && 'accessToken' in user) {
      token.accessToken = (user as any).accessToken
    }
    return token
  },
  async session({ session, token }) {
    (session as any).accessToken = (token as any).accessToken
    return session
  },
}
```

Теперь любые запросы к защищенным эндпоинтам можно делать с заголовком:
```ts
const session = await auth()
const res = await fetch(`${API_V1}/auth/me`, {
  headers: { Authorization: `Bearer ${(session as any).accessToken}` },
})
```

### Prisma клиент
Файл `frontend/frontend_project/lib/prisma.ts` добавлен. Импортируй `prisma` там, где нужно работать с БД фронта (NextAuth Adapter, регистрация и т.д.).

### Регистрация (пример)
```ts
// app/api/auth/register/route.ts (серверный обработчик)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  const { name, email, password } = parsed.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'User exists' }, { status: 409 })
  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { name, email, password: hash } })
  const { password: _omit, ...safe } = user
  return NextResponse.json({ message: 'ok', user: safe }, { status: 201 })
}
```

Компонент формы регистрации:
```tsx
'use client'
import { useState } from 'react'

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        setError('')
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) setError((await res.json()).error ?? 'error')
        else setOk(true)
      }}
      className="space-y-4"
    >
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
      <button type="submit">Register</button>
      {error && <p className="text-red-600">{error}</p>}
      {ok && <p className="text-green-600">OK</p>}
    </form>
  )
}
```

### UI и навигация
- Страницы авторизации находятся в `app/auth/*` — подключи формы к API выше.
- Приватные страницы — через `middleware.ts` и `auth.config.ts` (уже есть basic-проверки).

### Дорожная карта (frontend TODO)
- [ ] Перенести вызовы из `app/api/tests/route.ts` в клиент-библиотеку (`lib/apiClient.ts`) и использовать её в компонентах
- [ ] Добавить Credentials провайдер и связать с беком
- [ ] Добавить PrismaAdapter (по желанию) и миграции для пользовательских данных фронта
- [ ] Обработчики ошибок/тосты, спиннеры загрузки, оптимистичные апдейты
- [ ] Тесты компонентов и серверных функций

### Совет по структуре
- `lib/` — клиенты, утилиты
- `components/` — UI и контейнеры
- `app/api/` — прокси к бэку и внутренние сервисные роуты
- `types/` — общие типы, лучше генерировать от OpenAPI

Учись, двигаясь мелкими PR: сначала аутентификация, затем CRUD тестов на страницах, далее полировка UX.


