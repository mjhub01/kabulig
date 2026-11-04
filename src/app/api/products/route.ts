import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")

    let query = supabase
      .from('products')
      .select(`
        *,
        category:product_categories (*),
        farmer:farmer_profiles (
          id,
          farm_name,
          farm_location
        ),
        product_images (*)
      `)
      .eq('is_available', true)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: products, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Products fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      )
    }

    console.log("Products with farmer data:", JSON.stringify(products, null, 2))

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
