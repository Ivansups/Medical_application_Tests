// Страница входа в систему
// Здесь нужно создать форму для входа пользователей
// Можно использовать как OAuth провайдеры (Google, GitHub), так и обычную форму с email/password

// Импорты, которые понадобятся:
// import { signIn, getProviders } from "next-auth/react"
// import { getServerSession } from "next-auth"
// import { redirect } from "next/navigation"

export default function SignInPage() {
  // Здесь нужно:
  // 1. Получить список доступных провайдеров аутентификации
  // 2. Создать форму для входа с email/password (если используете Credentials провайдер)
  // 3. Добавить кнопки для OAuth провайдеров (Google, GitHub и т.д.)
  // 4. Обработать ошибки аутентификации
  // 5. Добавить редирект после успешного входа
  
  return (
    <div>
      {/* 
        Здесь должна быть ваша форма входа:
        
        1. Форма с полями email и password
        2. Кнопки для OAuth провайдеров
        3. Обработка ошибок
        4. Состояние загрузки
        5. Ссылка на страницу регистрации (если есть)
      */}
      
      <h1>Войти в систему</h1>
      
      {/* Пример структуры формы:
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Войти</button>
      </form>
      
      <div>
        <button onClick={() => signIn('google')}>Войти через Google</button>
        <button onClick={() => signIn('github')}>Войти через GitHub</button>
      </div>
      */}
    </div>
  )
}
