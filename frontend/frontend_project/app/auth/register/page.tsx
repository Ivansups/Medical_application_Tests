// Страница регистрации новых пользователей
// Если вы используете Credentials провайдер, вам понадобится эта страница

// Импорты, которые понадобятся:
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { signIn } from "next-auth/react"

export default function RegisterPage() {
  // Здесь нужно:
  // 1. Создать форму регистрации с валидацией
  // 2. Отправить данные на ваш API для создания пользователя
  // 3. После успешной регистрации автоматически войти в систему
  // 4. Обработать ошибки валидации и сервера
  // 5. Добавить проверку паролей (подтверждение пароля)
  
  return (
    <div>
      {/* 
        Здесь должна быть форма регистрации:
        
        1. Поля: имя, email, пароль, подтверждение пароля
        2. Валидация на клиенте (длина пароля, формат email)
        3. Отправка данных на API
        4. Обработка ответа от сервера
        5. Автоматический вход после успешной регистрации
        6. Ссылка на страницу входа
      */}
      
      <h1>Регистрация</h1>
      
      {/* Пример структуры формы:
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Имя" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Пароль" required />
        <input type="password" placeholder="Подтвердите пароль" required />
        <button type="submit">Зарегистрироваться</button>
      </form>
      
      <p>Уже есть аккаунт? <a href="/auth/signin">Войти</a></p>
      */}
    </div>
  )
}
