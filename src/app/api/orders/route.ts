import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can create orders" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { items, addressId } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Get customer profile
    const { data: customer } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    // Verify address belongs to customer
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('customer_id', customer.id)
      .single()

    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    // Calculate total and verify all products exist and have enough stock
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('*, farmer_id')
        .eq('id', item.productId)
        .single()

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const subtotal = product.price * item.quantity
      totalAmount += subtotal

      orderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal,
        farmer_id: product.farmer_id,
      })
    }

    // Create orders (one per farmer since multiple farmers' products can be in one cart)
    const orders = []
    const itemsByFarmer = new Map()

    // Group items by farmer
    for (const item of orderItems) {
      if (!itemsByFarmer.has(item.farmer_id)) {
        itemsByFarmer.set(item.farmer_id, [])
      }
      itemsByFarmer.get(item.farmer_id).push(item)
    }

    // Create an order for each farmer
    for (const [farmerId, farmerItems] of itemsByFarmer) {
      const farmerTotal = farmerItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          farmer_id: farmerId,
          status: 'PENDING',
          total_amount: farmerTotal,
          shipping_cost: 0,
          payment_status: 'PENDING',
          shipping_address: addressId,
        })
        .select()
        .single()

      if (orderError) {
        console.error("Order creation error:", orderError)
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        )
      }

      // Create order items
      for (const item of farmerItems) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })

        // Update product stock
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()

        if (currentProduct) {
          await supabase
            .from('products')
            .update({
              stock_quantity: currentProduct.stock_quantity - item.quantity
            })
            .eq('id', item.product_id)
        }
      }

      orders.push(order)
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        orders,
        totalAmount,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
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

    const { data: customer } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ orders: [] }, { status: 200 })
    }

    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        farmer:farmer_profiles (
          id,
          farm_name,
          farm_location
        ),
        order_items (
          *,
          product:products (
            name,
            product_images (image_url)
          )
        ),
        shipping_address_obj:addresses (*)
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
