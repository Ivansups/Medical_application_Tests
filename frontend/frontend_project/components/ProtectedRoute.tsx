// Компонент для защиты маршрутов
// Оборачивает контент, который должен быть доступен только авторизованным пользователям

// Импорты, которые понадобятся:
// import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode // что показывать во время загрузки
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  // Здесь нужно:
  // 1. Использовать useSession() для получения статуса сессии
  // 2. Показывать fallback во время загрузки
  // 3. Если не авторизован - редирект на страницу входа
  // 4. Если авторизован - показывать children
  
  return (
    <div>
      {/* 
        Логика компонента:
        
        1. const { data: session, status } = useSession()
        2. if (status === "loading") return fallback || <div>Loading...</div>
        3. if (status === "unauthenticated") {
             router.push('/auth/signin')
             return null
           }
        4. return <>{children}</>
      */}
      
      {/* Временный контент - замените на реальную логику */}
      <div>
        <p>Этот компонент защищает маршруты</p>
        <p>Замените этот контент на реальную логику проверки авторизации</p>
        {children}
      </div>
    </div>
  )
}
