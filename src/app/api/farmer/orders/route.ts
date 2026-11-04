import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { error: "Only farmers can view their orders" },
        { status: 403 }
      )
    }

    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json({ orders: [] }, { status: 200 })
    }

    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_profiles (
          id,
          user_id,
          contact_number
        ),
        customer_user:users (
          id,
          name,
          email
        ),
        order_items (
          *,
          product:products (
            name,
            product_images (image_url)
          )
        ),
        shipping_address_obj:addresses (*)
      `)
      .eq('farmer_id', farmer.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error("Farmer orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
