import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import * as bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role: role || 'CUSTOMER',
      })
      .select()
      .single()

    if (userError) {
      console.error("User creation error:", userError)
      return NextResponse.json(
        { error: "Failed to create user", details: userError.message, code: userError.code },
        { status: 500 }
      )
    }

    // Create profile based on role
    if (role === "FARMER") {
      await supabase.from('farmer_profiles').insert({
        user_id: user.id,
        farm_name: "",
        farm_location: "",
        contact_number: "",
        verification_status: "PENDING",
      })
    } else {
      await supabase.from('customer_profiles').insert({
        user_id: user.id,
        contact_number: "",
      })
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user.id,
        redirectUrl: role === "FARMER" ? "/farmer/profile" : "/customer/profile"
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Registration failed", details: errorMessage },
      { status: 500 }
    )
  }
}
