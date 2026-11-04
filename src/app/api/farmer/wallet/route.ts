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
        { error: "Only farmers can view wallet" },
        { status: 403 }
      )
    }

    const { data: farmer } = await supabase
      .from('farmer_profiles')
      .select('id, wallet_balance')
      .eq('user_id', session.user.id)
      .single()

    if (!farmer) {
      return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 })
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('farmer_id', farmer.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json(
      {
        walletBalance: farmer.wallet_balance || 0,
        transactions: transactions || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Wallet fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 })
  }
}
