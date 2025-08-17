'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import "./register-page.css";

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

  // Обработка ошибок из URL параметров
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'CredentialsSignin': 'Неверные данные для входа',
        'OAuthSignin': 'Ошибка при входе через социальную сеть',
        'OAuthCallback': 'Ошибка при обработке ответа от социальной сети',
        'OAuthCreateAccount': 'Ошибка при создании аккаунта',
        'EmailCreateAccount': 'Ошибка при создании аккаунта по email',
        'Callback': 'Ошибка при обработке ответа',
        'OAuthAccountNotLinked': 'Этот email уже используется другим методом входа',
        'EmailAlreadyExists': 'Пользователь с таким email уже существует',
        'WeakPassword': 'Пароль слишком слабый',
        'default': 'Произошла неизвестная ошибка'
      };
      
      setServerError(errorMessages[error] || errorMessages['default']);
    }
  }, [searchParams]);

  // Валидация формы
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    };
    
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
      newErrors.email = "Пожалуйста, введите корректный email";
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
      isValid = false;
    }
    
    if (!termsAccepted) {
      setServerError("Пожалуйста, примите условия использования");
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Обработчик изменения полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Расчет сложности пароля
    if (name === "password") {
      let strength = 0;
      if (value.length > 0) strength += 20;
      if (value.length >= 8) strength += 30;
      if (/[A-Z]/.test(value)) strength += 15;
      if (/[0-9]/.test(value)) strength += 15;
      if (/[^A-Za-z0-9]/.test(value)) strength += 20;
      
      setPasswordStrength(Math.min(strength, 100));
    }
    
    // Очистка ошибок при изменении
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Регистрация пользователя
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const registerData = await registerResponse.json();
      
      if (!registerResponse.ok) {
        throw new Error(registerData.message || "Ошибка регистрации");
      }

      // Автоматический вход после регистрации
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Перенаправление на защищенную страницу
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setServerError(error.message || "Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик OAuth входа
  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  // Определение цвета индикатора пароля
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "#ef4444"; // red
    if (passwordStrength < 70) return "#f59e0b"; // orange
    return "#10b981"; // green
  };

  return (
    <div className="registrationWindow">
      <div className="innerContainer">
        <h1 className="title">Регистрация</h1>
        
        {serverError && (
          <div className="serverError">
            {serverError}
          </div>
        )}
        
        <form id="registrationForm" className="form" onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="name" className="label">Имя</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`inputField ${errors.name ? "error" : ""}`}
              placeholder="Введите ваше имя"
            />
            {errors.name && (
              <div className="errorMessage">{errors.name}</div>
            )}
          </div>
          
          <div className="formGroup">
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`inputField ${errors.email ? "error" : ""}`}
              placeholder="Введите ваш email"
            />
            {errors.email && (
              <div className="errorMessage">{errors.email}</div>
            )}
          </div>
          
          <div className="formGroup">
            <label htmlFor="password" className="label">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`inputField ${errors.password ? "error" : ""}`}
              placeholder="Введите пароль"
            />
            <div className="passwordStrength">
              <div 
                className="strengthMeter" 
                style={{
                  width: `${passwordStrength}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}
              ></div>
            </div>
            {errors.password && (
              <div className="errorMessage">{errors.password}</div>
            )}
          </div>
          
          <div className="formGroup">
            <label htmlFor="confirmPassword" className="label">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`inputField ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Повторите пароль"
            />
            {errors.confirmPassword && (
              <div className="errorMessage">{errors.confirmPassword}</div>
            )}
          </div>
          
          <div className="termsCheckbox">
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="termsText">
              Я согласен с <a href="#" className="link">условиями использования</a> и 
              <a href="#" className="link">политикой конфиденциальности</a>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="submitButton"
            disabled={isLoading}
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
        
        <div className="divider">
          <span className="dividerText">или</span>
        </div>
        
        <div className="oauthSection">
          <p className="oauthTitle">Войти через социальные сети</p>
          <div className="oauthButtons">
            <button 
              className="oauthButton"
              onClick={() => handleOAuthSignIn("google")}
            >
              Google
            </button>
            <button 
              className="oauthButton"
              onClick={() => handleOAuthSignIn("github")}
            >
              GitHub
            </button>
          </div>
        </div>
        
        <div className="loginLink">
          <p className="loginText">
            Уже есть аккаунт?{" "}
            <Link href="/auth/signin" className="link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

