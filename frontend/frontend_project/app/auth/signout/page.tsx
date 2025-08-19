'use client';

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./signout-page.module.css";

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
    <div className={styles.container}>
      <div className={styles.logoutWindow}>
        <div className={styles.content}>
          <h1 className={styles.title}>Выход из системы</h1>
          
          <div className={styles.messageContainer}>
            <p className={styles.message}>Вы уверены, что хотите выйти?</p>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.buttonContainer}>
              <button 
                onClick={handleSignOut}
                disabled={isLoading}
                className={`${styles.button} ${styles.buttonLogout}`}
              >
                {isLoading ? 'Выход...' : 'Да, выйти'}
              </button>
              <button 
                onClick={handleCancel}
                disabled={isLoading}
                className={`${styles.button} ${styles.buttonCancel}`}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
