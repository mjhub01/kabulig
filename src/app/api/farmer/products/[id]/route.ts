import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    console.log("=== GET /api/farmer/products/[id] START ===")
    console.log("Params ID:", id)

    // First, try a simple query without joins
    const { data: simpleProduct, error: simpleError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    console.log("Simple query result:", simpleProduct)
    console.log("Simple query error:", simpleError)

    if (!simpleProduct) {
      console.log("Product not found in database (simple query)")
      return NextResponse.json({
        error: "Product not found",
        requestedId: id,
        details: simpleError
      }, { status: 404 })
    }

    // If simple query works, try with category join
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories (*)
      `)
      .eq('id', id)
      .single()

    console.log("Product with category result:", product)
    console.log("Product with category error:", error)

    if (!product) {
      console.log("Product not found (with category join), returning simple product")
      // Return the simple product without category if join fails
      return NextResponse.json({ product: simpleProduct }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      })
    }

    console.log("Product found, returning")
    return NextResponse.json({ product }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({
      error: "Failed to fetch product",
      requestedId: id,
      details: String(error)
    }, { status: 500 })
  }
}

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

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { error: "Only farmers can update products" },
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

    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 })
    }

    // Verify product belongs to farmer
    const { data: existingProduct } = await supabase
      .from('products')
      .select('farmer_id')
      .eq('id', id)
      .single()

    if (!existingProduct || existingProduct.farmer_id !== farmer.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        category_id: categoryId,
        name,
        description,
        price,
        stock_quantity: stockQuantity,
        product_type: productType,
        unit_of_measure: unitOfMeasure,
        is_available: isAvailable,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Product update error:", error)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

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

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { error: "Only farmers can delete products" },
        { status: 403 }
      )
    }

    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 })
    }

    // Verify product belongs to farmer
    const { data: existingProduct } = await supabase
      .from('products')
      .select('farmer_id')
      .eq('id', id)
      .single()

    if (!existingProduct || existingProduct.farmer_id !== farmer.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Product deletion error:", error)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted" }, { status: 200 })
  } catch (error) {
    console.error("Product deletion error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
