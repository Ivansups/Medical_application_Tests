// // API Route для регистрации новых пользователей
// // Этот endpoint будет вызываться с формы регистрации

// // Импорты, которые понадобятся:
// // import { NextRequest, NextResponse } from "next/server"
// // import bcrypt from "bcryptjs" // для хеширования паролей
// // import { prisma } from "@/lib/prisma" // если используете Prisma
// // import { z } from "zod" // для валидации данных

// export async function POST(request: NextRequest) {
//   // Здесь нужно:
//   // 1. Получить данные из тела запроса (email, password, name)
//   // 2. Валидировать данные (формат email, длина пароля)
//   // 3. Проверить, не существует ли уже пользователь с таким email
//   // 4. Захешировать пароль
//   // 5. Создать пользователя в базе данных
//   // 6. Вернуть успешный ответ или ошибку
  
//   try {
//     // 1. Получение данных
//     const body = await request.json()
//     const { email, password, name } = body
    
//     // 2. Валидация данных
//     // Проверьте формат email, длину пароля и т.д.
    
//     // 3. Проверка существования пользователя
//     // const existingUser = await prisma.user.findUnique({ where: { email } })
//     // if (existingUser) {
//     //   return NextResponse.json({ error: "User already exists" }, { status: 400 })
//     // }
    
//     // 4. Хеширование пароля
//     // const hashedPassword = await bcrypt.hash(password, 12)
    
//     // 5. Создание пользователя
//     // const user = await prisma.user.create({
//     //   data: {
//     //     email,
//     //     name,
//     //     password: hashedPassword,
//     //   },
//     // })
    
//     // 6. Возврат успешного ответа
//     return NextResponse.json({ 
//       message: "User created successfully",
//       // user: { id: user.id, email: user.email, name: user.name }
//     })
    
//   } catch (error) {
//     // Обработка ошибок
//     console.error("Registration error:", error)
//     return NextResponse.json(
//       { error: "Internal server error" }, 
//       { status: 500 }
//     )
//   }
// }
