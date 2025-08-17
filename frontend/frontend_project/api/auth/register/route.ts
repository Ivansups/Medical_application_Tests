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
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(3, "Min length is 3 characters").max(50, "Cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
})

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const result = registerSchema.safeParse(requestBody)
    if (!result.success) {
      return NextResponse.json({ error: "Validation error", details: result.error.flatten() }, { status: 400 })
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = await prisma.user.create({ data: { name, email, password: hashedPassword } })
    const { password: _omit, ...safeUser } = newUser
    return NextResponse.json({ message: "User registered successfully", user: safeUser }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}