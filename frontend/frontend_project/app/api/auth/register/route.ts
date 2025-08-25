import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://172.18.0.3:8000";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Произошла внутренняя ошибка сервера"
    }, { status: 500 });
  }
}