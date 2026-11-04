"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

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
  payment_status: string
  created_at: string
  customer_user: {
    name: string
    email: string
  }
  customer: {
    contact_number: string
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

export default function FarmerOrdersPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    loadOrders()
  }, [session, router])

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/farmer/orders")
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(`/api/farmer/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        loadOrders()
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  const statusFlow = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your incoming orders and update their status</p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Incoming Orders</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No orders yet</p>
          <p className="text-sm text-gray-500">Orders will appear here when customers purchase your products</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p className="text-gray-700">{order.customer_user.name}</p>
                  <p className="text-gray-600 text-sm">{order.customer_user.email}</p>
                  <p className="text-gray-600 text-sm">{order.customer.contact_number}</p>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p className="text-gray-700">{order.shipping_address_obj.street}</p>
                  <p className="text-gray-600 text-sm">{order.shipping_address_obj.barangay}</p>
                  <p className="text-gray-600 text-sm">{order.shipping_address_obj.city}</p>
                  <p className="text-gray-600 text-sm">
                    {order.shipping_address_obj.province}, {order.shipping_address_obj.zip_code}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div>
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

              {/* Total and Actions */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-lg font-semibold">Total: ₱{order.total_amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {statusFlow[order.status].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => updateOrderStatus(order.id, nextStatus)}
                      disabled={updatingOrderId === order.id}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        nextStatus === "CANCELLED"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingOrderId === order.id ? "Updating..." : nextStatus}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
