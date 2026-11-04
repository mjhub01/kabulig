"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Address {
  id: string
  street: string
  barangay: string
  city: string
  province: string
  zip_code: string
  is_default: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Get session
    auth().then((s) => {
      if (!s?.user) {
        router.push("/login")
        return
      }
      setSession(s)
      loadCart()
      loadAddresses()
    })
  }, [router])

  const loadCart = () => {
    const cartData = localStorage.getItem("cart")
    if (cartData) {
      setCart(JSON.parse(cartData))
    }
  }

  const loadAddresses = async () => {
    try {
      const response = await fetch("/api/customer/addresses")
      const data = await response.json()
      if (response.ok) {
        setAddresses(data.addresses || [])
        const defaultAddress = data.addresses?.find((a: Address) => a.is_default)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id)
        }
      }
    } catch (error) {
      console.error("Failed to load addresses:", error)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedAddress) {
      setError("Please select a delivery address")
      return
    }

    if (cart.length === 0) {
      setError("Your cart is empty")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          addressId: selectedAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Checkout failed")
      } else {
        // Clear cart
        localStorage.removeItem("cart")
        // Redirect to order confirmation
        router.push(`/orders/${data.orders[0].id}`)
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Address selection */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No addresses found</p>
                  <a
                    href="/customer/addresses"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Address
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">{address.street}</p>
                        <p className="text-sm text-gray-600">
                          {address.barangay}, {address.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.province}, {address.zip_code}
                        </p>
                        {address.is_default && (
                          <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                  <a
                    href="/customer/addresses"
                    className="inline-block text-green-600 hover:text-green-700 text-sm"
                  >
                    + Add new address
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Order summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0 || !selectedAddress}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
