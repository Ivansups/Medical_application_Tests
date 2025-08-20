'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './dashboard/dashboard-styles.css';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const handleGuestAccess = () => {
    router.push('/dashboard/guest_dashboard');
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <main className="p-4">
      <div className="header-content flex justify-between items-center flex-wrap">
        <div className="user-info">
          <i className="fas fa-heartbeat user-icon"></i>
          <span>Медицинское приложение</span>
        </div>
        <div className="auth-buttons flex">
          <button onClick={handleSignIn} className="button_primary">
            <i className="fas fa-sign-in-alt mr-2"></i>Войти
          </button>
          <button onClick={handleRegister} className="button_secondary">
            <i className="fas fa-user-plus mr-2"></i>Регистрация
          </button>
        </div>
      </div>
      
      <div className="content-container">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
            Добро пожаловать в медицинское приложение
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-xl text-gray-600 mb-4">
              Инновационная платформа для обучения и тестирования медицинских знаний
            </p>
            <button onClick={handleGuestAccess} className="button_success text-lg px-8 py-3">
              <i className="fas fa-eye mr-2"></i>Попробовать как гость
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="dashboard-card text-center">
              <i className="fas fa-graduation-cap text-4xl text-blue-600 mb-4"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Обучение</h3>
              <p className="text-gray-600">
                Изучайте медицинские темы с помощью интерактивных материалов и тестов
              </p>
            </div>
            
            <div className="dashboard-card text-center">
              <i className="fas fa-clipboard-check text-4xl text-green-600 mb-4"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Тестирование</h3>
              <p className="text-gray-600">
                Проверяйте свои знания с помощью разнообразных тестов и заданий
              </p>
            </div>
            
            <div className="dashboard-card text-center">
              <i className="fas fa-chart-line text-4xl text-purple-600 mb-4"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Аналитика</h3>
              <p className="text-gray-600">
                Отслеживайте свой прогресс и получайте детальную аналитику результатов
              </p>
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Возможности системы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Интерактивные медицинские тесты</li>
                <li>Детальная аналитика результатов</li>
                <li>Персонализированные рекомендации</li>
                <li>Система достижений и наград</li>
              </ul>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Адаптивное обучение</li>
                <li>Мобильная версия</li>
                <li>Безопасное хранение данных</li>
                <li>Круглосуточная поддержка</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}