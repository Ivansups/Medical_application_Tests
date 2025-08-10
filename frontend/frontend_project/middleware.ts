// Middleware для защиты маршрутов
// Этот файл автоматически выполняется для каждого запроса
// Можно использовать для проверки авторизации на уровне маршрутов

// Импорты, которые понадобятся:
// import { withAuth } from "next-auth/middleware"
// import { NextResponse } from "next/server"

// Конфигурация middleware
export default function middleware() {
  // Здесь нужно:
  // 1. Настроить защиту определенных маршрутов
  // 2. Добавить редирект для неавторизованных пользователей
  // 3. Возможно, добавить проверку ролей
  // 4. Настроить обработку API маршрутов
  
  // Пример использования withAuth:
  // return withAuth(
  //   function onSuccess(req) {
  //     // Дополнительная логика после успешной авторизации
  //     return NextResponse.next()
  //   },
  //   {
  //     callbacks: {
  //       authorized: ({ token }) => !!token
  //     },
  //     pages: {
  //       signIn: '/auth/signin'
  //     }
  //   }
  // )(req)
  
  // Или более простой вариант:
  // return withAuth({
  //   pages: {
  //     signIn: '/auth/signin'
  //   }
  // })(req)
  
  return NextResponse.next() // временно пропускаем все запросы
}

// Конфигурация для каких маршрутов применять middleware
export const config = {
  // Здесь нужно указать паттерны маршрутов для защиты:
  // matcher: [
  //   '/dashboard/:path*',
  //   '/profile/:path*',
  //   '/admin/:path*',
  //   '/api/protected/:path*'
  // ]
  
  // Временно защищаем только дашборд:
  matcher: ['/dashboard/:path*']
}
