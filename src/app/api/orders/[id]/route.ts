import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        farmer:farmer_profiles (
          id,
          farm_name,
          farm_location
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
      .eq('id', id)
      .eq('customer_id', customer.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order }, { status: 200 })
  } catch (error) {
    console.error("Order fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
