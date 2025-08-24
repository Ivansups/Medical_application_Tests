'use client';
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react"; // Добавлен импорт useState
import "../auth-common.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Инициализирован значением false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Неверные данные для входа");
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-content">
          <h1 className="auth-title">Вход</h1>
          
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <input
                type="email"
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="auth-form-group">
              <input
                type="password"
                className="auth-input"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {/* ✅ Спиннер во время загрузки */}
            {isLoading ? (
              <div className="auth-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <button
                type="submit"
                className="auth-button"
              >
                Войти
              </button>
            )}
          </form>

          <div className="auth-form-group" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p className="auth-message">
              Нет аккаунта?{" "}
              <Link href="/auth/register" className="auth-link">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}