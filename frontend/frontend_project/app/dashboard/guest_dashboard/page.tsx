'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../dashboard-styles.css';

export default function GuestDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null>(null);

  useEffect(() => {
    // Анимация при наведении на кнопки
    const buttons = document.querySelectorAll('button');
    
    const handleMouseEnter = function(this: HTMLElement) {
      this.style.transform = 'translateY(-2px)';
    };
    
    const handleMouseLeave = function(this: HTMLElement) {
      this.style.transform = 'translateY(0)';
    };

    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    });

    // Очистка обработчиков событий при размонтировании
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await router.push('/auth/signin');
    } catch (error) {
      console.error('Ошибка при переходе на страницу входа:', error);
      setNotification({
        message: 'Произошла ошибка при переходе на страницу входа',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await router.push('/auth/register');
    } catch (error) {
      console.error('Ошибка при переходе на страницу регистрации:', error);
      setNotification({
        message: 'Произошла ошибка при переходе на страницу регистрации',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearnMore = () => {
    setNotification({
      message: 'Здесь будет переход на страницу с дополнительной информацией',
      type: 'info'
    });
  };

  return (
    <main className="p-4">
      <div className="header-content flex justify-between items-center flex-wrap">
        <div className="user-info">
          <i className="fas fa-user-circle user-icon"></i>
          <span>Guest</span>
        </div>
        <div className="auth-buttons flex">
          <button 
            onClick={handleSignIn} 
            className="button_primary"
            disabled={isLoading}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            {isLoading ? 'Загрузка...' : 'Sign In'}
          </button>
          <button 
            onClick={handleRegister} 
            className="button_secondary"
            disabled={isLoading}
          >
            <i className="fas fa-user-plus mr-2"></i>
            {isLoading ? 'Загрузка...' : 'Register'}
          </button>
        </div>
      </div>
      <div className="content-container">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Добро пожаловать в гостевой кабинет
          </h1>
          
          <div className="text-center">
            <div className="text-gray-700 mb-8 text-lg text-left space-y-4">
              <p>
                Это гостевой доступ к нашему сервису. Здесь вы можете ознакомиться с основными возможностями системы.
              </p>
              <p>
                Для получения полного доступа ко всем функциям, пожалуйста, зарегистрируйтесь или войдите в систему.
              </p>
              <p>Наш сервис предлагает:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Удобный интерфейс управления</li>
                <li>Безопасное хранение данных</li>
                <li>Гибкие настройки профиля</li>
                <li>Круглосуточную поддержку</li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-4 mt-8">
              <button onClick={handleLearnMore} className="button_primary">
                <i className="fas fa-info-circle mr-2"></i>Узнать больше
              </button>
            </div>
          </div>
        </div>
              </div>
      </main>
  );
}