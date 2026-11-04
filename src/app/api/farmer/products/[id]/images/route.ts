import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(
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
        { error: "Only farmers can upload images" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("image") as File
    const altText = formData.get("altText") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "products")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${id}-${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Get current max order
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('order')
      .eq('product_id', id)
      .order('order', { ascending: false })
      .limit(1)

    const maxOrder = existingImages && existingImages.length > 0 ? existingImages[0].order : 0

    // Create image record
    const { data: image, error } = await supabase
      .from('product_images')
      .insert({
        product_id: id,
        image_url: `/uploads/products/${filename}`,
        alt_text: altText || null,
        order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error("Image upload error:", error)
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }

    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

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

    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('order', { ascending: true })

    return NextResponse.json({ images: images || [] }, { status: 200 })
  } catch (error) {
    console.error("Images fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
