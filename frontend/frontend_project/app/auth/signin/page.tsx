'use client'

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import "../auth-common.css"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверные email или пароль")
      } else {
        setSuccess("Успешный вход! Перенаправление...")
        setTimeout(() => {
          router.push(callbackUrl)
        }, 1000)
      }
    } catch (error) {
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError("")
    
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setError(`Ошибка при входе через ${provider}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-content">
          <h1 className="auth-title">Вход в систему</h1>
          
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="auth-error-message" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                placeholder="Введите ваш email"
                required
              />
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                placeholder="Введите ваш пароль"
                required
              />
            </div>
            
            <div className="auth-form-group">
              <label className="auth-label">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                Запомнить меня
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-text">или</span>
          </div>
          
          <div className="auth-oauth-section">
            <p className="auth-oauth-title">Войти через социальные сети</p>
            <div className="auth-oauth-buttons">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="auth-oauth-button"
              >
                Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="auth-oauth-button"
              >
                GitHub
              </button>
            </div>
          </div>
          
          <div className="auth-form-group" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p className="auth-message">
              Ещё нет аккаунта?{" "}
              <Link href="/auth/register" className="auth-link">
                Зарегистрироваться
              </Link>
            </p>
            <p className="auth-message" style={{ marginTop: '0.5rem' }}>
              <Link href="/auth/forgot-password" className="auth-link">
                Забыли пароль?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}