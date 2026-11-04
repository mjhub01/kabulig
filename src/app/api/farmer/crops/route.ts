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
        { error: "Only farmers can view crops" },
        { status: 403 }
      )
    }

    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json({ crops: [] }, { status: 200 })
    }

    const { data: crops } = await supabase
      .from('crop_cycles')
      .select('*')
      .eq('farmer_id', farmer.id)
      .order('planting_date', { ascending: false })

    return NextResponse.json({ crops: crops || [] }, { status: 200 })
  } catch (error) {
    console.error("Crops fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 })
  }
}
