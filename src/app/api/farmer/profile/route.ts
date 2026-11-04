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
        { error: "Only farmers can update farmer profiles" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { farmName, farmLocation, farmSize, contactNumber, bankAccountDetails } = body

    // Update or create farmer profile
    const { data: profile, error } = await supabase
      .from('farmer_profiles')
      .upsert({
        user_id: session.user.id,
        farm_name: farmName,
        farm_location: farmLocation,
        farm_size: farmSize,
        contact_number: contactNumber,
        bank_account_details: bankAccountDetails,
      })
      .select()
      .single()

    if (error) {
      console.error("Profile update error:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('farmer_profiles')
      .select(`
        *,
        verification_documents (*)
      `)
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
