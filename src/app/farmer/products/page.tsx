"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  product_type: string
  is_available: boolean
  category: {
    name: string
  }
  product_images: {
    image_url: string
  }[]
}

export default function FarmerProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/farmer/products")
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetch(`/api/farmer/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProducts()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete product")
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert("An error occurred while deleting the product")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
        <Link
          href="/farmer/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
          <Link
            href="/farmer/products/new"
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            List your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.is_available
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
                <p className="text-2xl font-bold text-green-700 mb-2">
                  ₱{product.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Stock: {product.stock_quantity} | {product.product_type}
                </p>
                <div className="flex space-x-2">
                  <Link
                    href={`/farmer/products/${product.id}/edit`}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
