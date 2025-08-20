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
import "../auth-common.css"

export default function AuthErrorPage() {
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
      case 'OAuthSignin':
        return 'Ошибка при входе через социальную сеть'
      case 'OAuthCallback':
        return 'Ошибка при обработке ответа от социальной сети'
      case 'OAuthCreateAccount':
        return 'Ошибка при создании аккаунта'
      case 'EmailCreateAccount':
        return 'Ошибка при создании аккаунта по email'
      case 'Callback':
        return 'Ошибка при обработке ответа'
      case 'EmailAlreadyExists':
        return 'Пользователь с таким email уже существует'
      case 'WeakPassword':
        return 'Пароль слишком слабый'
      default:
        return 'Произошла неизвестная ошибка'
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-content">
          <h1 className="auth-title">Ошибка аутентификации</h1>
          
          <div className="auth-message">
            Что-то пошло не так при попытке входа в систему. Пожалуйста, попробуйте снова.
          </div>
          
          <div className="auth-error-message">
            Ошибка: {getErrorMessage(error)}
          </div>
          
          <div className="auth-form-group">
            <Link href="/auth/signin">
              <button className="auth-button">
                Попробовать снова
              </button>
            </Link>
          </div>
          
          <div className="auth-form-group">
            <Link href="/">
              <button className="auth-button secondary">
                На главную
              </button>
            </Link>
          </div>
          
          <div className="auth-form-group" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p className="auth-message">
              Нужна помощь?{" "}
              <Link href="/auth/register" className="auth-link">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
