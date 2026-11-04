import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { street, barangay, city, province, zipCode, isDefault } = body

    // Get customer profile
    const { data: customer } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    // If setting as default, unset previous default
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customer.id)
        .eq('is_default', true)
    }

    // Create address
    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        customer_id: customer.id,
        street,
        barangay,
        city,
        province,
        zip_code: zipCode,
        is_default: isDefault || false,
      })
      .select()
      .single()

    if (error) {
      console.error("Address creation error:", error)
      return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
    }

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error("Address creation error:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ addresses: [] }, { status: 200 })
    }

    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', customer.id)
      .order('is_default', { ascending: false })

    return NextResponse.json({ addresses }, { status: 200 })
  } catch (error) {
    console.error("Address fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}
