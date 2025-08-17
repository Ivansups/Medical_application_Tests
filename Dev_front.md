## Фронтенд разработчику: руководство и учебник

Next.js (App Router) + NextAuth + Prisma. Этот файл — не просто инструкции, а учебник с примерами и практикой интеграции с нашим FastAPI бэкендом.

### Технологии
- Next.js 14 (app/ directory)
- TypeScript
- NextAuth (JWT strategy)
- Prisma (для пользовательских данных фронта)

## 🏗️ Архитектура Frontend приложений

### Современная архитектура React/Next.js приложений

```
┌─────────────────────────────────────┐
│           Presentation Layer        │ ← Components, Pages, UI
├─────────────────────────────────────┤
│           Business Logic Layer      │ ← Hooks, Services, State Management
├─────────────────────────────────────┤
│           Data Access Layer         │ ← API Clients, Data Fetching
├─────────────────────────────────────┤
│           Infrastructure Layer      │ ← Routing, Auth, External APIs
└─────────────────────────────────────┘
```

**Принципы:**
- **Component Composition**: переиспользуемые компоненты
- **Separation of Concerns**: логика отделена от представления
- **Single Source of Truth**: централизованное управление состоянием

### Паттерны проектирования

#### 1. Container/Presentational Pattern
```tsx
// components/presentational/TestCard.tsx
interface TestCardProps {
  test: Test
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TestCard({ test, onEdit, onDelete }: TestCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold">{test.title}</h3>
      <p className="text-gray-600">{test.description}</p>
      <div className="flex gap-2 mt-4">
        {onEdit && (
          <button onClick={() => onEdit(test.id)} className="btn btn-primary">
            Редактировать
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(test.id)} className="btn btn-danger">
            Удалить
          </button>
        )}
      </div>
    </div>
  )
}

// components/containers/TestListContainer.tsx
export function TestListContainer() {
  const { data: tests, isLoading, error } = useTests()
  const { mutate: deleteTest } = useDeleteTest()
  
  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error.message}</div>
  
  return (
    <div className="grid gap-4">
      {tests?.map(test => (
        <TestCard
          key={test.id}
          test={test}
          onDelete={(id) => deleteTest(id)}
        />
      ))}
    </div>
  )
}
```

#### 2. Custom Hooks Pattern
```tsx
// hooks/useTests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export function useTests(skip = 0, limit = 10) {
  return useQuery({
    queryKey: ['tests', skip, limit],
    queryFn: () => apiClient.getTests(skip, limit),
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

export function useTest(id: string) {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => apiClient.getTestById(id),
    enabled: !!id,
  })
}

export function useCreateTest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (testData: TestCreate) => apiClient.createTest(testData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
  })
}

export function useUpdateTest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestUpdate }) =>
      apiClient.updateTest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['test', id] })
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
  })
}

export function useDeleteTest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
  })
}
```

#### 3. Service Layer Pattern
```tsx
// services/testService.ts
import { apiClient } from '@/lib/apiClient'
import type { Test, TestCreate, TestUpdate } from '@/types/test'

export class TestService {
  static async getAllTests(skip = 0, limit = 10): Promise<Test[]> {
    try {
      return await apiClient.getTests(skip, limit)
    } catch (error) {
      console.error('Failed to fetch tests:', error)
      throw new Error('Не удалось загрузить тесты')
    }
  }
  
  static async getTestById(id: string): Promise<Test> {
    try {
      return await apiClient.getTestById(id)
    } catch (error) {
      console.error('Failed to fetch test:', error)
      throw new Error('Не удалось загрузить тест')
    }
  }
  
  static async createTest(testData: TestCreate): Promise<Test> {
    try {
      // Валидация на клиенте
      if (!testData.title.trim()) {
        throw new Error('Название теста обязательно')
      }
      
      if (testData.questions.length === 0) {
        throw new Error('Тест должен содержать хотя бы один вопрос')
      }
      
      return await apiClient.createTest(testData)
    } catch (error) {
      console.error('Failed to create test:', error)
      throw error
    }
  }
  
  static async updateTest(id: string, testData: TestUpdate): Promise<Test> {
    try {
      return await apiClient.updateTest(id, testData)
    } catch (error) {
      console.error('Failed to update test:', error)
      throw new Error('Не удалось обновить тест')
    }
  }
  
  static async deleteTest(id: string): Promise<void> {
    try {
      await apiClient.deleteTest(id)
    } catch (error) {
      console.error('Failed to delete test:', error)
      throw new Error('Не удалось удалить тест')
    }
  }
}
```

### State Management

#### 1. React Query (TanStack Query)
```tsx
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

#### 2. Zustand для локального состояния
```tsx
// stores/testStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TestStore {
  selectedTestId: string | null
  filters: {
    search: string
    category: string
    duration: number | null
  }
  setSelectedTest: (id: string | null) => void
  setFilters: (filters: Partial<TestStore['filters']>) => void
  resetFilters: () => void
}

export const useTestStore = create<TestStore>()(
  devtools(
    (set) => ({
      selectedTestId: null,
      filters: {
        search: '',
        category: '',
        duration: null,
      },
      setSelectedTest: (id) => set({ selectedTestId: id }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () =>
        set({
          filters: {
            search: '',
            category: '',
            duration: null,
          },
        }),
    }),
    { name: 'test-store' }
  )
)
```

### Middleware и Interceptors

#### 1. Next.js Middleware
```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Публичные маршруты
  const publicRoutes = ['/auth/signin', '/auth/register', '/api/auth']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Защищенные маршруты
  const token = await getToken({ req: request })
  
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // Проверка ролей (если нужно)
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
  ],
}
```

#### 2. API Route Middleware
```tsx
// lib/apiMiddleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'

export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return handler(req, session)
  }
}

export async function withRole(
  requiredRole: string,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (session.user.role !== requiredRole) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    return handler(req, session)
  }
}
```

#### 3. Error Boundary
```tsx
// components/ErrorBoundary.tsx
'use client'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Здесь можно отправить ошибку в сервис мониторинга
  }
  
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h2 className="text-lg font-semibold text-red-800">
              Что-то пошло не так
            </h2>
            <p className="text-red-600 mt-2">
              Произошла ошибка при загрузке компонента
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Попробовать снова
            </button>
          </div>
        )
      )
    }
    
    return this.props.children
  }
}
```

### Form Management

#### 1. React Hook Form
```tsx
// hooks/useTestForm.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const testSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200, 'Слишком длинное название'),
  description: z.string().max(1000, 'Слишком длинное описание').optional(),
  duration: z.number().min(1, 'Длительность должна быть больше 0').max(480, 'Максимум 8 часов'),
  questions: z.array(z.object({
    question_text: z.string().min(1, 'Текст вопроса обязателен'),
    options: z.array(z.string()).optional(),
    correct_answers: z.array(z.number()).optional(),
    question_type: z.enum(['single_choice', 'multiple_choice', 'open_ended']),
  })).min(1, 'Должен быть хотя бы один вопрос'),
})

type TestFormData = z.infer<typeof testSchema>

export function useTestForm(defaultValues?: Partial<TestFormData>) {
  return useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: 30,
      questions: [],
      ...defaultValues,
    },
  })
}

// components/TestForm.tsx
'use client'
import { useForm, useFieldArray } from 'react-hook-form'
import { useTestForm } from '@/hooks/useTestForm'
import { useCreateTest } from '@/hooks/useTests'

export function TestForm() {
  const form = useTestForm()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  })
  
  const createTest = useCreateTest()
  
  const onSubmit = async (data: TestFormData) => {
    try {
      await createTest.mutateAsync(data)
      form.reset()
    } catch (error) {
      console.error('Failed to create test:', error)
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Название теста
        </label>
        <input
          {...form.register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          {...form.register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Длительность (минуты)
        </label>
        <input
          type="number"
          {...form.register('duration', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Вопросы
          </label>
          <button
            type="button"
            onClick={() => append({
              question_text: '',
              question_type: 'single_choice',
              options: [''],
              correct_answers: [],
            })}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Добавить вопрос
          </button>
        </div>
        
        {fields.map((field, index) => (
          <div key={field.id} className="mt-4 p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium">Вопрос {index + 1}</h4>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800"
              >
                Удалить
              </button>
            </div>
            
            <input
              {...form.register(`questions.${index}.question_text`)}
              placeholder="Текст вопроса"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
            />
            
            <select
              {...form.register(`questions.${index}.question_type`)}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="single_choice">Один ответ</option>
              <option value="multiple_choice">Несколько ответов</option>
              <option value="open_ended">Открытый вопрос</option>
            </select>
          </div>
        ))}
      </div>
      
      <button
        type="submit"
        disabled={createTest.isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {createTest.isPending ? 'Создание...' : 'Создать тест'}
      </button>
    </form>
  )
}
```

### Performance Optimization

#### 1. Code Splitting
```tsx
// app/dashboard/page.tsx
import dynamic from 'next/dynamic'

// Ленивая загрузка тяжелых компонентов
const TestEditor = dynamic(() => import('@/components/TestEditor'), {
  loading: () => <div>Загрузка редактора...</div>,
  ssr: false, // Отключаем SSR для компонентов с браузерными API
})

const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
  loading: () => <div>Загрузка графика...</div>,
})

export default function DashboardPage() {
  return (
    <div>
      <h1>Дашборд</h1>
      <TestEditor />
      <AnalyticsChart />
    </div>
  )
}
```

#### 2. Memoization
```tsx
// components/OptimizedTestList.tsx
import { memo, useMemo } from 'react'

interface TestListProps {
  tests: Test[]
  filters: TestFilters
}

export const OptimizedTestList = memo(function TestList({ tests, filters }: TestListProps) {
  // Мемоизация фильтрации
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      if (filters.search && !test.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.category && test.category !== filters.category) {
        return false
      }
      if (filters.duration && test.duration > filters.duration) {
        return false
      }
      return true
    })
  }, [tests, filters])
  
  // Мемоизация сортировки
  const sortedTests = useMemo(() => {
    return [...filteredTests].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [filteredTests])
  
  return (
    <div className="grid gap-4">
      {sortedTests.map(test => (
        <TestCard key={test.id} test={test} />
      ))}
    </div>
  )
})
```

#### 3. Virtual Scrolling
```tsx
// components/VirtualTestList.tsx
import { FixedSizeList as List } from 'react-window'

interface VirtualTestListProps {
  tests: Test[]
  height: number
  itemHeight: number
}

export function VirtualTestList({ tests, height, itemHeight }: VirtualTestListProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TestCard test={tests[index]} />
    </div>
  )
  
  return (
    <List
      height={height}
      itemCount={tests.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### Security Best Practices

#### 1. Input Validation
```tsx
// lib/validation.ts
import { z } from 'zod'

export const sanitizeInput = (input: string): string => {
  // Удаляем HTML теги
  return input.replace(/<[^>]*>/g, '').trim()
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // Минимум 8 символов, хотя бы одна буква и цифра
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Схемы валидации
export const userSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
})
```

#### 2. XSS Protection
```tsx
// components/SafeContent.tsx
import DOMPurify from 'dompurify'

interface SafeContentProps {
  content: string
  className?: string
}

export function SafeContent({ content, className }: SafeContentProps) {
  const sanitizedContent = DOMPurify.sanitize(content)
  
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}

// Использование
<SafeContent 
  content={userProvidedContent} 
  className="prose max-w-none" 
/>
```

### Testing Strategies

#### 1. Unit Tests (Jest + Testing Library)
```tsx
// __tests__/components/TestCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TestCard } from '@/components/TestCard'

const mockTest = {
  id: '1',
  title: 'Test Title',
  description: 'Test Description',
  duration: 30,
  questions: [],
}

describe('TestCard', () => {
  it('renders test information correctly', () => {
    render(<TestCard test={mockTest} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<TestCard test={mockTest} onEdit={mockOnEdit} />)
    
    fireEvent.click(screen.getByText('Редактировать'))
    expect(mockOnEdit).toHaveBeenCalledWith('1')
  })
  
  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn()
    render(<TestCard test={mockTest} onDelete={mockOnDelete} />)
    
    fireEvent.click(screen.getByText('Удалить'))
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })
})
```

#### 2. Integration Tests
```tsx
// __tests__/pages/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '@/app/dashboard/page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

describe('DashboardPage', () => {
  it('renders dashboard with tests', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Личный кабинет')).toBeInTheDocument()
    })
  })
})
```

#### 3. E2E Tests (Playwright)
```tsx
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Логин перед каждым тестом
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('[type="submit"]')
    await page.waitForURL('/dashboard')
  })
  
  test('should display user tests', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Личный кабинет')
    await expect(page.locator('[data-testid="test-card"]')).toHaveCount(3)
  })
  
  test('should create new test', async ({ page }) => {
    await page.click('[data-testid="create-test-button"]')
    await page.fill('[name="title"]', 'New Test')
    await page.fill('[name="description"]', 'Test Description')
    await page.click('[type="submit"]')
    
    await expect(page.locator('text=New Test')).toBeVisible()
  })
})
```

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


