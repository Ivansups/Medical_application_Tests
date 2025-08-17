// // Страница ошибок аутентификации
// // NextAuth автоматически перенаправляет сюда при ошибках входа

// // Импорты, которые понадобятся:
// // import { useSearchParams } from "next/navigation"

// 'use client'

// import { useSearchParams } from 'next/navigation'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { signIn } from 'next-auth/react'


// export default function ErrorPage() {
//   // Здесь нужно:
//   // 1. Получить параметр error из URL (useSearchParams)
//   // 2. Показать соответствующее сообщение об ошибке
//   // 3. Предоставить ссылку для возврата к странице входа
//   // 4. Возможно, логирование ошибки

//   const searchParams = useSearchParams()
//   const error = searchParams.get('error')

//   if (error) {
  
//   return (
//     <div>
//       {/* 
//         Здесь должна быть страница ошибок:
        
//         1. Получение параметра error из URL
//         2. Отображение понятного сообщения об ошибке
//         3. Кнопка "Попробовать снова" (ссылка на /auth/signin)
//         4. Кнопка "Вернуться на главную" (ссылка на /)
//         5. Возможно, форма обратной связи
//       */}
      
//       <h1>Ошибка аутентификации</h1>
      
//       {/* Пример структуры:
//       const searchParams = useSearchParams()
//       const error = searchParams.get('error')
      
//       <div>
//         <h2>Что-то пошло не так</h2>
//         <p>Ошибка: {error}</p>
//         <a href="/auth/signin">Попробовать снова</a>
//         <a href="/">Вернуться на главную</a>
//       </div>
//       */}
//     </div>
//   )
// }
// }

'use client'

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import "./error-page.css"

export default function Home() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Неверные учетные данные'
      case 'SessionRequired':
        return 'Требуется вход в систему'
      case 'AccessDenied':
        return 'Доступ запрещен'
      case 'OAuthAccountNotLinked':
        return 'Аккаунт не связан'
      default:
        return 'Произошла неизвестная ошибка'
    }
  }

  return (
    <div className="error-container">
      <div className="error-window">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Ошибка аутентификации</h1>
          <p className="text-gray-600 mb-8">
            Что-то пошло не так при попытке входа в систему. Пожалуйста, попробуйте снова.
          </p>
          
          <div className="text-red-500 mb-8 p-4 bg-red-50 rounded-lg">
            Ошибка: {getErrorMessage(error)}
          </div>
          
          <div className="flex justify-center mb-8">
            <Link href="/auth/signin">
              <button className="button_reg" style={{ color: '#4b5563' }}>
                Попробовать снова
              </button>
            </Link>
            <Link href="/">
              <button className="button_reg" style={{ color: '#4b5563' }}>
                На главную
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
