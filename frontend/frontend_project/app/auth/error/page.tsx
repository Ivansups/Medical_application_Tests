'use client'
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import "../auth-common.css"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

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
        return error || 'Произошла неизвестная ошибка'
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
            <strong>Ошибка:</strong> {getErrorMessage(error)}
          </div>

          {/* ✅ Показываем описание ошибки для разработки */}
          {errorDescription && (
            <div className="auth-error-description">
              <strong>Описание:</strong> {errorDescription}
            </div>
          )}

          {/* ✅ Показываем код ошибки для разработки */}
          {error && (
            <div className="auth-error-code">
              <strong>Код ошибки:</strong> {error}
            </div>
          )}
          
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