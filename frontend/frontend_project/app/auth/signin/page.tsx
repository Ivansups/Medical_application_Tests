'use client'

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import "./signin-page.css"

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
    <div className="login-container">
      <div className="login-window">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Вход в систему
          </h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Введите ваш email"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Введите ваш пароль"
                required
              />
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="remember" className="text-gray-700">
                Запомнить меня
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-text">или</div>
          </div>
          
          <div className="oauth-section rounded-lg">
            <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
              Войти через социальные сети
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="button_reg2"
              >
                Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="button_reg2"
              >
                GitHub
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Ещё нет аккаунта?{" "}
              <Link href="/auth/register" className="text-blue-500 hover:underline">
                Зарегистрироваться
              </Link>
            </p>
            <p className="text-gray-600 mt-2">
              <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">
                Забыли пароль?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}