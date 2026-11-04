import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { error: "Only farmers can create products" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      categoryId,
      name,
      description,
      price,
      stockQuantity,
      productType,
      unitOfMeasure,
      isAvailable,
    } = body

    // Get farmer profile
    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json(
        { error: "Farmer profile not found" },
        { status: 404 }
      )
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        farmer_id: farmer.id,
        category_id: categoryId,
        name,
        description,
        price,
        stock_quantity: stockQuantity,
        product_type: productType,
        unit_of_measure: unitOfMeasure,
        is_available: isAvailable ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error("Product creation error:", error)
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { error: "Only farmers can view their products" },
        { status: 403 }
      )
    }

    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories (*),
        product_images (*)
      `)
      .eq('farmer_id', farmer.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Products fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      )
    }

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
