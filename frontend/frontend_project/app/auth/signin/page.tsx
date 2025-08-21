'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { setCookie } from "@/lib/cookies";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Неверные данные для входа");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="signinWindow">
      <div className="innerContainer">
        <h1 className="title">Вход</h1>
        {error && <div className="serverError">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Войти</button>
        </form>
        <div className="loginLink">
          <p className="loginText">
            Нет аккаунта?{" "}
            <a href="/auth/register" className="link">
              Зарегистрироваться
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}