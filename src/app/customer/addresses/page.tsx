"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Address {
  id: string
  street: string
  barangay: string
  city: string
  province: string
  zipCode: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    street: "",
    barangay: "",
    city: "",
    province: "",
    zipCode: "",
    isDefault: false,
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/customer/addresses")
      const data = await response.json()
      if (response.ok) {
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      const response = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Failed to add address")
      } else {
        setMessage("Address added successfully!")
        setShowForm(false)
        setFormData({
          street: "",
          barangay: "",
          city: "",
          province: "",
          zipCode: "",
          isDefault: false,
        })
        fetchAddresses()
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/customer/addresses/${addressId}/default`, {
        method: "PATCH",
      })

      if (response.ok) {
        fetchAddresses()
      }
    } catch (error) {
      console.error("Failed to set default address:", error)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchAddresses()
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8 px-4">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-green-700">My Addresses</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showForm ? "Cancel" : "Add New Address"}
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded ${
              message.includes("success")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {message}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barangay *</label>
                  <input
                    type="text"
                    value={formData.barangay}
                    onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Barangay Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="City Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Province Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1234"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Add Address
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No addresses added yet.</p>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg ${
                    address.isDefault ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  {address.isDefault && (
                    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded mb-2">
                      Default
                    </span>
                  )}
                  <p className="font-medium">{address.street}</p>
                  <p className="text-gray-600">
                    {address.barangay}, {address.city}
                  </p>
                  <p className="text-gray-600">
                    {address.province}, {address.zipCode}
                  </p>
                  <div className="mt-3 space-x-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
