import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(50, "Имя не может превышать 50 символов"),
  email: z.string().email("Пожалуйста, введите корректный email"),
  password: z.string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .regex(/[a-z]/, "Пароль должен содержать хотя бы одну строчную букву")
    .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру")
    .regex(/[!@#$%^&*]/, "Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*)"),
});

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const result = registerSchema.safeParse(requestBody);
    
if (!result.success) {
  const fieldErrors: Record<string, string> = {};
  
  result.error.issues.forEach(issue => {
    if (
      issue.path.length > 0 && 
      typeof issue.path[0] === 'string' && 
      !fieldErrors[issue.path[0]]
    ) {
      fieldErrors[issue.path[0]] = issue.message;
    }
  });

  return NextResponse.json(
    { error: "Validation error", details: fieldErrors },
    { status: 400 }
  );
}

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ 
        error: "EmailAlreadyExists", 
        message: "Пользователь с таким email уже существует" 
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({ 
      data: { 
        name, 
        email, 
        password: hashedPassword,
        isActive: true,
        createdAt: new Date()
      } 
    });
    
    // Удаляем пароль из ответа
    const { password: _omit, ...safeUser } = newUser;
    return NextResponse.json({ 
      message: "Пользователь успешно зарегистрирован", 
      user: safeUser 
    }, { status: 201 });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Произошла внутренняя ошибка сервера"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}