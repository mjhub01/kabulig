"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function FarmerProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    farmName: "",
    farmLocation: "",
    farmSize: "",
    contactNumber: "",
    bankAccountDetails: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/farmer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Failed to update profile")
      } else {
        setMessage("Profile updated successfully!")
        setTimeout(() => router.push("/farmer/orders"), 2000)
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Farmer Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Complete Your Profile</h2>

          {message && (
            <div className={`mb-4 p-4 rounded ${
              message.includes("success")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name *
              </label>
              <input
                id="farmName"
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="My Farm"
              />
            </div>

            <div>
              <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700 mb-2">
                Farm Location *
              </label>
              <input
                id="farmLocation"
                type="text"
                value={formData.farmLocation}
                onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="City, Province"
              />
            </div>

            <div>
              <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (hectares)
              </label>
              <input
                id="farmSize"
                type="text"
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 5 hectares"
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="09123456789"
              />
            </div>

            <div>
              <label htmlFor="bankAccountDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account Details (for withdrawals)
              </label>
              <textarea
                id="bankAccountDetails"
                value={formData.bankAccountDetails}
                onChange={(e) => setFormData({ ...formData, bankAccountDetails: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Bank name, Account number, Account holder name"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Verification Required</h3>
              <p className="text-sm text-yellow-700 mb-3">
                To sell products, you need to upload verification documents. Please submit:
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>Valid ID (government-issued)</li>
                <li>Business permit or farmer's ID</li>
                <li>Tax ID (if applicable)</li>
              </ul>
              <button
                type="button"
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Upload Documents (Coming Soon)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
