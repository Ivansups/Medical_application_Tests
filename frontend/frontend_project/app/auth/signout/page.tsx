'use client';

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../auth-common.css";

export default function SignOutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверка параметров URL на наличие ошибок
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'SignoutError': 'Ошибка при выходе из системы',
        'default': 'Произошла неизвестная ошибка'
      };
      
      setError(errorMessages[errorParam] || errorMessages['default']);
    }
  }, []);

  // Функция выхода из системы
  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (err) {
      console.error('Ошибка при выходе:', err);
      setError('Произошла ошибка при выходе из системы');
      setIsLoading(false);
    }
  };

  // Функция отмены
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-content">
          <h1 className="auth-title">Выход из системы</h1>
          
          <div className="auth-message">
            Вы уверены, что хотите выйти?
          </div>
          
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}
          
          <div className="auth-form-group">
            <button 
              onClick={handleSignOut}
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'Выход...' : 'Да, выйти'}
            </button>
          </div>
          
          <div className="auth-form-group">
            <button 
              onClick={handleCancel}
              disabled={isLoading}
              className="auth-button secondary"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
