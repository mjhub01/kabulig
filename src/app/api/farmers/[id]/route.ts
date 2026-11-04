import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch farmer profile with user info
    const { data: farmer, error: farmerError } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (farmerError || !farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
    }

    // Fetch user info separately
    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('id', farmer.user_id)
      .single()

    // Fetch farmer's products
    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories (name),
        product_images (
          image_url
        )
      `)
      .eq('farmer_id', id)
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    // Count total products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', id)

    return NextResponse.json({
      farmer: {
        id: farmer.id,
        farmName: farmer.farm_name,
        farmLocation: farmer.farm_location,
        farmSize: farmer.farm_size,
        contactNumber: farmer.contact_number,
        verificationStatus: farmer.verification_status,
        userName: user?.name,
        createdAt: farmer.created_at,
      },
      products: products || [],
      totalProducts: count || 0,
    }, { status: 200 })
  } catch (error) {
    console.error("Farmer profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch farmer profile" }, { status: 500 })
  }
}
