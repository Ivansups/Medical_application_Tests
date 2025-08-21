'use client';
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/api/auth/client";
import { setCookie } from "@/lib/cookies";
import Link from "next/link";
import "../auth-common.css";

interface LoginResponse {
  access_token: string;
  id: string;
  is_admin: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const messages: Record<string, string> = {
        'EmailAlreadyExists': 'Пользователь с таким email уже существует',
        'default': 'Произошла ошибка'
      };
      setServerError(messages[error] || messages['default']);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен быть не менее 8 символов";
      isValid = false;
    } else {
      const errors = [];
      if (!/[A-Z]/.test(formData.password)) errors.push("заглавную букву");
      if (!/[a-z]/.test(formData.password)) errors.push("строчную букву");
      if (!/[0-9]/.test(formData.password)) errors.push("цифру");
      if (!/[!@#$%^&*]/.test(formData.password)) errors.push("спецсимвол");
      if (errors.length > 0) {
        newErrors.password = `Пароль должен содержать: ${errors.join(', ')}`;
        isValid = false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
      isValid = false;
    }

    if (!termsAccepted) {
      setServerError("Примите условия использования");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[a-z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[!@#$%^&*]/.test(value)) strength += 25;
      setPasswordStrength(Math.min(strength, 100));
    }

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const loginResponse = await apiClient.post<LoginResponse>('/auth/token', {
        username: formData.email,
        password: formData.password
      });

      if (loginResponse.access_token) {
        setCookie('access_token', loginResponse.access_token, 7);
      }

      router.push("/dashboard");
    } catch (error: any) {
      if (error.response?.data?.error === "EmailAlreadyExists") {
        setServerError("Пользователь с таким email уже существует");
      } else if (error.response?.status === 400 && error.response?.data?.details) {
        setErrors(error.response.data.details);
      } else {
        setServerError("Произошла ошибка при регистрации");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "#ef4444";
    if (passwordStrength < 70) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-content">
          <h1 className="auth-title">Регистрация</h1>
          
          {serverError && (
            <div className="auth-error-message">
              {serverError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="name" className="auth-label">Имя</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`auth-input ${errors.name ? "error" : ""}`}
                placeholder="Введите ваше имя"
              />
              {errors.name && (
                <div className="auth-error">{errors.name}</div>
              )}
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`auth-input ${errors.email ? "error" : ""}`}
                placeholder="Введите ваш email"
              />
              {errors.email && (
                <div className="auth-error">{errors.email}</div>
              )}
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? "error" : ""}`}
                placeholder="Введите пароль"
              />
              <div className="password-strength">
                <div 
                  className="strength-meter" 
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getPasswordStrengthColor(),
                    height: '4px',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }}
                ></div>
              </div>
              {errors.password && (
                <div className="auth-error">{errors.password}</div>
              )}
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder="Повторите пароль"
              />
              {errors.confirmPassword && (
                <div className="auth-error">{errors.confirmPassword}</div>
              )}
            </div>
            
            <div className="auth-form-group">
              <label className="auth-label">
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Я согласен с <a href="#" className="auth-link">условиями использования</a> и 
                <a href="#" className="auth-link"> политикой конфиденциальности</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
          
          <div className="auth-divider">
            <span className="auth-divider-text">или</span>
          </div>
          
          <div className="auth-form-group" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p className="auth-message">
              Уже есть аккаунт?{" "}
              <Link href="/auth/signin" className="auth-link">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}