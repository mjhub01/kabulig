import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json(
        { error: "Only farmers can delete images" },
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

    // Get image details
    const { data: image } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Delete file from filesystem
    const filepath = join(process.cwd(), "public", image.image_url)
    try {
      await unlink(filepath)
    } catch (error) {
      console.error("Failed to delete file:", error)
      // Continue with database deletion even if file deletion fails
    }

    // Delete image record
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error("Image deletion error:", error)
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    return NextResponse.json({ message: "Image deleted" }, { status: 200 })
  } catch (error) {
    console.error("Image deletion error:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
