import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    // Here you would add your user creation logic, e.g., save to DB
    // For now, just mock success if all fields are present
    const required = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "password",
      "password_confirm",
    ]
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ message: `Missing field: ${field}` }, { status: 400 })
      }
    }
    if (data.password !== data.password_confirm) {
      return NextResponse.json({ message: "Passwords do not match." }, { status: 400 })
    }
    // Simulate success
    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 })
  }
} 