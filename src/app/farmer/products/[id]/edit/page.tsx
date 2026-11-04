"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  product_type: string
  unit_of_measure: string
  is_available: boolean
  category_id: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    productType: "RAW" as "RAW" | "PROCESSED",
    unitOfMeasure: "",
    isAvailable: true,
  })

  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    fetchCategories()
    fetchProduct()
  }, [session, router, params.id])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/products/categories")
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchProduct = async () => {
    try {
      console.log("=== Client: Starting fetchProduct ===")
      console.log("Product ID:", params.id)
      const response = await fetch(`/api/farmer/products/${params.id}`)
      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Product data:", data)
      if (response.ok) {
        const product = data.product
        console.log("Setting form data from product:", product)
        setFormData({
          categoryId: product.category_id,
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          stockQuantity: product.stock_quantity.toString(),
          productType: product.product_type,
          unitOfMeasure: product.unit_of_measure,
          isAvailable: product.is_available,
        })
      } else {
        console.error("Error fetching product:", data.error)
        console.error("Error details:", data.details)
        console.error("Requested ID:", data.requestedId)
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const response = await fetch(`/api/farmer/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Failed to update product")
      } else {
        setMessage("Product updated successfully!")
        setTimeout(() => router.push("/farmer/products"), 2000)
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <Link
            href={`/farmer/products/${params.id}/images`}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Manage Images
          </Link>
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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Product Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-gray-900 mb-2">
              Product Type *
            </label>
            <select
              id="productType"
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value as "RAW" | "PROCESSED" })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="RAW">Raw Product</option>
              <option value="PROCESSED">Processed Product</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-900 mb-2">
                Price (PHP) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-900 mb-2">
                Stock Quantity *
              </label>
              <input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-900 mb-2">
              Unit of Measure *
            </label>
            <input
              id="unitOfMeasure"
              type="text"
              value={formData.unitOfMeasure}
              onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-900">
              Product is available for sale
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}
