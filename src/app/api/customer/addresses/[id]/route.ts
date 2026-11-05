import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function DELETE(
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
      .select('id, default_address_id')
      .eq('user_id', session.user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    // Verify address belongs to customer
    const { data: address } = await supabase
      .from('addresses')
      .select('customer_id')
      .eq('id', id)
      .single()

    if (!address || address.customer_id !== customer.id) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Delete address
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Address deletion error:", error)
      return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
    }

    // If this was the default address, clear it from customer profile
    if (customer.default_address_id === id) {
      await supabase
        .from('customer_profiles')
        .update({ default_address_id: null })
        .eq('id', customer.id)
    }

    return NextResponse.json({ message: "Address deleted" }, { status: 200 })
  } catch (error) {
    console.error("Address deletion error:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
