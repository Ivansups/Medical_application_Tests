'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../dashboard-styles.css';

export default function AdminPanel() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Моковые данные для демонстрации
  const stats = [
    { title: 'Всего пользователей', value: '1,234', icon: 'fas fa-users' },
    { title: 'Активных тестов', value: '56', icon: 'fas fa-clipboard-list' },
    { title: 'Завершенных тестов', value: '892', icon: 'fas fa-check-circle' },
    { title: 'Средний балл', value: '87%', icon: 'fas fa-chart-line' }
  ];

  const recentUsers = [
    { id: 1, name: 'Иван Петров', email: 'ivan@example.com', status: 'Активен', date: '2024-01-15' },
    { id: 2, name: 'Мария Сидорова', email: 'maria@example.com', status: 'Активен', date: '2024-01-14' },
    { id: 3, name: 'Алексей Козлов', email: 'alex@example.com', status: 'Неактивен', date: '2024-01-13' },
    { id: 4, name: 'Елена Волкова', email: 'elena@example.com', status: 'Активен', date: '2024-01-12' }
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

  const handleManageUsers = () => {
    alert('Переход к управлению пользователями');
  };

  const handleManageTests = () => {
    alert('Переход к управлению тестами');
  };

  const handleAnalytics = () => {
    alert('Переход к аналитике');
  };

  const handleSettings = () => {
    alert('Переход к настройкам');
  };

  const handleLogout = () => {
    router.push('/auth/signout');
  };

  return (
    <main className="p-4">
      <div className="header-content flex justify-between items-center flex-wrap">
        <div className="user-info">
          <i className="fas fa-user-shield user-icon"></i>
          <span>Администратор</span>
        </div>
        <div className="auth-buttons flex">
          <button onClick={handleSettings} className="button_secondary">
            <i className="fas fa-cog mr-2"></i>Настройки
          </button>
          <button onClick={handleLogout} className="button_warning">
            <i className="fas fa-sign-out-alt mr-2"></i>Выйти
          </button>
        </div>
      </div>
      
      <div className="content-container">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Панель администратора
          </h1>
          
          {/* Статистика */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <i className={`${stat.icon} text-3xl mb-2`}></i>
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Кнопки управления */}
          <div className="dashboard-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={handleManageUsers} className="button_primary">
                <i className="fas fa-users mr-2"></i>Управление пользователями
              </button>
              <button onClick={handleManageTests} className="button_success">
                <i className="fas fa-clipboard-list mr-2"></i>Управление тестами
              </button>
              <button onClick={handleAnalytics} className="button_secondary">
                <i className="fas fa-chart-bar mr-2"></i>Аналитика
              </button>
              <button onClick={handleSettings} className="button_warning">
                <i className="fas fa-cog mr-2"></i>Настройки системы
              </button>
            </div>
          </div>

          {/* Последние пользователи */}
          <div className="dashboard-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Последние пользователи</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'Активен' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
