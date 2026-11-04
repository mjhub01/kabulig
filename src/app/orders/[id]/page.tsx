"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  subtotal: number
  product: {
    name: string
    product_images: { image_url: string }[]
  }
}

interface Order {
  id: string
  status: string
  total_amount: number
  shipping_cost: number
  payment_status: string
  created_at: string
  farmer: {
    farm_name: string
    farm_location: string
  }
  order_items: OrderItem[]
  shipping_address_obj: {
    street: string
    barangay: string
    city: string
    province: string
    zip_code: string
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      const session = await auth()
      if (!session?.user) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/orders/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
      } else {
        setError(data.error || "Failed to load order")
      }
    } catch (error) {
      setError("An error occurred while loading the order")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error || "Order not found"}
          </div>
          <button
            onClick={() => router.push("/orders")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/orders")}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ₱{item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">₱{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₱{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>₱{order.shipping_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>₱{(order.total_amount + order.shipping_cost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div>
              <p className="font-medium">{order.shipping_address_obj.street}</p>
              <p className="text-gray-600">{order.shipping_address_obj.barangay}</p>
              <p className="text-gray-600">{order.shipping_address_obj.city}</p>
              <p className="text-gray-600">
                {order.shipping_address_obj.province}, {order.shipping_address_obj.zip_code}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
            <div>
              <p className="font-medium">{order.farmer.farm_name}</p>
              <p className="text-gray-600">{order.farmer.farm_location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.payment_status === "PAID"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {order.payment_status}
          </span>
        </div>
      </div>
    </div>
  )
}
