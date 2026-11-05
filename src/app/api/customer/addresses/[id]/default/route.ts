import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function PATCH(
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

    // Unset previous default
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('customer_id', customer.id)
      .eq('is_default', true)

    // Set new default
    const { data: address } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single()

    // Update customer's default address
    await supabase
      .from('customer_profiles')
      .update({ default_address_id: id })
      .eq('id', customer.id)

    return NextResponse.json({ address }, { status: 200 })
  } catch (error) {
    console.error("Set default address error:", error)
    return NextResponse.json({ error: "Failed to set default address" }, { status: 500 })
  }
}
