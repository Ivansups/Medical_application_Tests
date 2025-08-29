'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../dashboard-styles.css';
import './personal-cabinet.css';
import UserStats from './components/UserStats';
import AvailableTests from './components/AvailableTests';
import RecentResults from './components/RecentResults';
import Achievements from './components/Achievements';
import Header from './components/Header';

export default function PersonalCabinet() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Пользователь',
    email: 'user@example.com',
    avatar: null
  });

  // Моковые данные для демонстрации
  const userStats = [
    { title: 'Пройдено тестов', value: '15', icon: 'fas fa-check-circle', color: 'text-green-600' },
    { title: 'Средний балл', value: '87%', icon: 'fas fa-chart-line', color: 'text-blue-600' },
    { title: 'Время обучения', value: '32ч', icon: 'fas fa-clock', color: 'text-purple-600' },
    { title: 'Достижения', value: '12', icon: 'fas fa-trophy', color: 'text-yellow-600' }
  ];

  const availableTests = [
    { 
      id: 1, 
      title: 'Анатомия человека', 
      description: 'Основы анатомии и физиологии человеческого организма', 
      questions: 25, 
      time: '35 мин',
      difficulty: 'Средний',
      category: 'Анатомия'
    },
    { 
      id: 2, 
      title: 'Фармакология', 
      description: 'Лекарственные препараты и их фармакологическое действие', 
      questions: 30, 
      time: '45 мин',
      difficulty: 'Сложный',
      category: 'Фармакология'
    },
    { 
      id: 3, 
      title: 'Диагностика', 
      description: 'Современные методы диагностики различных заболеваний', 
      questions: 20, 
      time: '25 мин',
      difficulty: 'Легкий',
      category: 'Диагностика'
    },
    { 
      id: 4, 
      title: 'Первая помощь', 
      description: 'Экстренная медицинская помощь в критических ситуациях', 
      questions: 35, 
      time: '50 мин',
      difficulty: 'Средний',
      category: 'Экстренная медицина'
    },
    { 
      id: 5, 
      title: 'Хирургия', 
      description: 'Основы хирургических вмешательств и операций', 
      questions: 40, 
      time: '60 мин',
      difficulty: 'Сложный',
      category: 'Хирургия'
    },
    { 
      id: 6, 
      title: 'Педиатрия', 
      description: 'Особенности диагностики и лечения детских заболеваний', 
      questions: 22, 
      time: '30 мин',
      difficulty: 'Средний',
      category: 'Педиатрия'
    }
  ];

  const recentResults = [
    { id: 1, test: 'Анатомия человека', score: 88, date: '2024-01-18', status: 'Завершен', timeSpent: '28 мин' },
    { id: 2, test: 'Фармакология', score: 94, date: '2024-01-15', status: 'Завершен', timeSpent: '42 мин' },
    { id: 3, test: 'Диагностика', score: 82, date: '2024-01-12', status: 'Завершен', timeSpent: '22 мин' },
    { id: 4, test: 'Первая помощь', score: 91, date: '2024-01-10', status: 'Завершен', timeSpent: '45 мин' },
    { id: 5, test: 'Хирургия', score: 76, date: '2024-01-08', status: 'Завершен', timeSpent: '55 мин' }
  ];

  const achievements = [
    { 
      id: 1, 
      title: 'Первые шаги', 
      description: 'Пройдите первый тест', 
      icon: 'fas fa-trophy', 
      color: 'bg-yellow-100 text-yellow-600',
      unlocked: true,
      progress: 100
    },
    { 
      id: 2, 
      title: 'Отличник', 
      description: 'Получите 90%+ баллов в 5 тестах', 
      icon: 'fas fa-star', 
      color: 'bg-blue-100 text-blue-600',
      unlocked: true,
      progress: 100
    },
    { 
      id: 3, 
      title: 'Серия побед', 
      description: 'Пройдите 10 тестов подряд с результатом выше 80%', 
      icon: 'fas fa-fire', 
      color: 'bg-green-100 text-green-600',
      unlocked: false,
      progress: 70
    },
    { 
      id: 4, 
      title: 'Мастер знаний', 
      description: 'Пройдите все тесты хотя бы один раз', 
      icon: 'fas fa-crown', 
      color: 'bg-purple-100 text-purple-600',
      unlocked: false,
      progress: 60
    },
    { 
      id: 5, 
      title: 'Скоростник', 
      description: 'Пройдите тест быстрее среднего времени на 20%', 
      icon: 'fas fa-bolt', 
      color: 'bg-orange-100 text-orange-600',
      unlocked: true,
      progress: 100
    },
    { 
      id: 6, 
      title: 'Перфекционист', 
      description: 'Получите 100% баллов в любом тесте', 
      icon: 'fas fa-gem', 
      color: 'bg-pink-100 text-pink-600',
      unlocked: false,
      progress: 0
    }
  ];

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

  const handleStartTest = (testId: number) => {
    setIsLoading(true);
    // Здесь будет логика начала теста
    setTimeout(() => {
      alert(`Начинаем тест ${testId}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleViewResults = () => {
    router.push('/dashboard/results');
  };

  const handleViewProfile = () => {
    router.push('/dashboard/profile');
  };

  const handleLogout = () => {
    router.push('/auth/signout');
  };

  const handleEditProfile = () => {
    router.push('/dashboard/profile/edit');
  };

  return (
    <main className="p-4 min-h-screen bg-gray-50">
      <Header 
        userData={userData}
        onViewProfile={handleViewProfile}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />
      
      <div className="content-container">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2 text-center" style={{color: '#000000'}}>
              Личный кабинет
            </h1>
            <p className="text-black text-center" style={{color: '#000000'}}>
              Добро пожаловать в ваш персональный кабинет для обучения
            </p>
          </div>
          
          {/* Статистика пользователя */}
          <UserStats stats={userStats} />

          {/* Доступные тесты */}
          <AvailableTests 
            tests={availableTests} 
            onStartTest={handleStartTest}
            isLoading={isLoading}
          />

          {/* Последние результаты */}
          <RecentResults 
            results={recentResults}
            onViewAllResults={handleViewResults}
          />

          {/* Достижения */}
          <Achievements achievements={achievements} />
        </div>
      </div>
    </main>
  );
}

