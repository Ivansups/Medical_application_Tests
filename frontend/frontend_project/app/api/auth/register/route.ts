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
import prisma from "@/lib/prisma" // если используете Prisma
import { z } from "zod" // для валидации данных
import { th } from "zod/locales"

const registerSchema = z.object({
    name: z.string()
        .min(3, "Min lenght is 3 characters")
        .max(50, "Cannot exeed 50 characters"),
    email: z.string()
        .email("Ivalid email adress"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one numbeer")
        .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
    })

export async function POST(request: NextRequest) {
    try {
        const reqestBody = await request.json()
        const validationResult = registerSchema.safeParse(reqestBody)
    if (!validationResult.success) {
      return NextResponse.json(
        { status: 400 }
      )
    }
    // Проверяю, не существует ли пользователь с таким же email
    const {name, email, password} = validationResult.data
        const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser){
        return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
        )
    }
    const saltRaunds = 12
    // Создаю нового пользователя
    const hashedPassword = await bcrypt.hash(password, saltRaunds)
    const newUser = await prisma.user.create({
        name,
        email,
        password: hashedPassword
    })
    const { password: _, ...safeUserData } = newUser
    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: safeUserData 
      },
      { status: 201 } // Все прошло успешно
    )
    
    } catch (error) {
    console.error("Registration error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}