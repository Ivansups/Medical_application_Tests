'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../dashboard-styles.css';

export default function UserDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Моковые данные для демонстрации
  const userStats = [
    { title: 'Пройдено тестов', value: '12', icon: 'fas fa-check-circle' },
    { title: 'Средний балл', value: '85%', icon: 'fas fa-chart-line' },
    { title: 'Время обучения', value: '24ч', icon: 'fas fa-clock' },
    { title: 'Достижения', value: '8', icon: 'fas fa-trophy' }
  ];

  const availableTests = [
    { id: 1, title: 'Анатомия человека', description: 'Основы анатомии и физиологии', questions: 20, time: '30 мин' },
    { id: 2, title: 'Фармакология', description: 'Лекарственные препараты и их действие', questions: 25, time: '45 мин' },
    { id: 3, title: 'Диагностика', description: 'Методы диагностики заболеваний', questions: 15, time: '20 мин' },
    { id: 4, title: 'Первая помощь', description: 'Экстренная медицинская помощь', questions: 30, time: '60 мин' }
  ];

  const recentResults = [
    { id: 1, test: 'Анатомия человека', score: 85, date: '2024-01-15', status: 'Завершен' },
    { id: 2, test: 'Фармакология', score: 92, date: '2024-01-12', status: 'Завершен' },
    { id: 3, test: 'Диагностика', score: 78, date: '2024-01-10', status: 'Завершен' }
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
    alert(`Начинаем тест ${testId}`);
  };

  const handleViewResults = () => {
    alert('Переход к результатам');
  };

  const handleViewProfile = () => {
    alert('Переход к профилю');
  };

  const handleLogout = () => {
    router.push('/auth/signout');
  };

  return (
    <main className="p-4">
      <div className="header-content flex justify-between items-center flex-wrap">
        <div className="user-info">
          <i className="fas fa-user-circle user-icon"></i>
          <span>Пользователь</span>
        </div>
        <div className="auth-buttons flex">
          <button onClick={handleViewProfile} className="button_secondary">
            <i className="fas fa-user mr-2"></i>Профиль
          </button>
          <button onClick={handleLogout} className="button_warning">
            <i className="fas fa-sign-out-alt mr-2"></i>Выйти
          </button>
        </div>
      </div>
      
      <div className="content-container">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Личный кабинет
          </h1>
          
          {/* Статистика пользователя */}
          <div className="stats-grid">
            {userStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <i className={`${stat.icon} text-3xl mb-2`}></i>
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Доступные тесты */}
          <div className="dashboard-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Доступные тесты</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTests.map((test) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{test.title}</h3>
                  <p className="text-gray-600 mb-3">{test.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span><i className="fas fa-question-circle mr-1"></i>{test.questions} вопросов</span>
                    <span><i className="fas fa-clock mr-1"></i>{test.time}</span>
                  </div>
                  <button 
                    onClick={() => handleStartTest(test.id)}
                    className="button_primary w-full"
                  >
                    <i className="fas fa-play mr-2"></i>Начать тест
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Последние результаты */}
          <div className="dashboard-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Последние результаты</h2>
              <button onClick={handleViewResults} className="button_secondary">
                <i className="fas fa-chart-bar mr-2"></i>Все результаты
              </button>
            </div>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Тест</th>
                  <th>Балл</th>
                  <th>Дата</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.test}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.score >= 90 
                          ? 'bg-green-100 text-green-800'
                          : result.score >= 80
                          ? 'bg-blue-100 text-blue-800'
                          : result.score >= 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td>{result.date}</td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Достижения */}
          <div className="dashboard-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Достижения</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-100 rounded-lg">
                <i className="fas fa-trophy text-2xl text-yellow-600 mb-2"></i>
                <p className="text-sm font-semibold">Первые шаги</p>
                <p className="text-xs text-gray-600">Пройдите первый тест</p>
              </div>
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <i className="fas fa-star text-2xl text-blue-600 mb-2"></i>
                <p className="text-sm font-semibold">Отличник</p>
                <p className="text-xs text-gray-600">Получите 90%+ баллов</p>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <i className="fas fa-fire text-2xl text-green-600 mb-2"></i>
                <p className="text-sm font-semibold">Серия побед</p>
                <p className="text-xs text-gray-600">5 тестов подряд</p>
              </div>
              <div className="text-center p-4 bg-purple-100 rounded-lg">
                <i className="fas fa-crown text-2xl text-purple-600 mb-2"></i>
                <p className="text-sm font-semibold">Мастер</p>
                <p className="text-xs text-gray-600">Все тесты на 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
