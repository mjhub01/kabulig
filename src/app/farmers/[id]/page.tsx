"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  product_type: string
  is_available: boolean
  category: {
    name: string
  } | null
  product_images: {
    image_url: string
  }[]
}

interface Farmer {
  id: string
  farmName: string
  farmLocation: string
  farmSize: string | null
  contactNumber: string
  verificationStatus: string
  userName: string | null
  createdAt: string
}

export default function FarmerProfilePage() {
  const params = useParams()
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    fetchFarmerProfile()
  }, [params.id])

  const fetchFarmerProfile = async () => {
    try {
      const response = await fetch(`/api/farmers/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setFarmer(data.farmer)
        setProducts(data.products)
        setTotalProducts(data.totalProducts)
      }
    } catch (error) {
      console.error("Failed to fetch farmer profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farmer profile...</p>
        </div>
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Farmer Not Found</h1>
          <Link href="/" className="text-green-600 hover:text-green-700">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const verificationBadge = {
    PENDING: "bg-yellow-100 text-yellow-800",
    VERIFIED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  }[farmer.verificationStatus] || "bg-gray-100 text-gray-800"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-green-600 text-4xl font-bold shadow-lg">
              {farmer.farmName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{farmer.farmName}</h1>
              <p className="text-green-100 mb-3">{farmer.userName || "Farmer"}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${verificationBadge}`}>
                  {farmer.verificationStatus}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                  {totalProducts} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Farmer Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">{farmer.farmLocation}</p>
                </div>
                {farmer.farmSize && (
                  <div>
                    <p className="text-sm text-gray-500">Farm Size</p>
                    <p className="text-gray-900 font-medium">{farmer.farmSize}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-900 font-medium">{farmer.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(farmer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 mb-4">No products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {product.product_images.length > 0 ? (
                      <img
                        src={product.product_images[0].image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {product.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.category?.name || "Uncategorized"}</p>
                      <p className="text-2xl font-bold text-green-700 mb-2">
                        ₱{product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Stock: {product.stock_quantity} | {product.product_type}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
