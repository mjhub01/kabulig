"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  product_type: string
  unit_of_measure: string
  is_available: boolean
  category: {
    name: string
  }
  farmer: {
    id: string
    farm_name: string
    farm_location: string
  }
  product_images: {
    image_url: string
    alt_text?: string
  }[]
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  unitOfMeasure: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setProduct(data.product)
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const cartData = localStorage.getItem("cart")
    const cart: CartItem[] = cartData ? JSON.parse(cartData) : []

    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        unitOfMeasure: product.unit_of_measure,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Added to cart!")
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8 px-4">Loading...</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Product not found</h1>
          <Link href="/products" className="text-green-600 hover:text-green-700">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/products"
          className="inline-block text-green-600 hover:text-green-700 mb-6"
        >
          ← Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              {product.product_images.length > 0 ? (
                <img
                  src={product.product_images[0].image_url}
                  alt={product.product_images[0].alt_text || product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded mb-4">
                {product.category.name}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-baseline mb-4">
                <p className="text-4xl font-bold text-green-700">
                  ₱{product.price.toFixed(2)}
                </p>
                <p className="text-gray-600 ml-2">/{product.unit_of_measure}</p>
              </div>

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded text-sm ${
                  product.is_available
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {product.is_available ? "In Stock" : "Out of Stock"}
                </span>
                <span className="ml-4 text-gray-600">
                  {product.stock_quantity} available
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Farmer</h3>
                <Link
                  href={`/farmers/${product.farmer.id}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {product.farmer.farm_name}
                </Link>
                <p className="text-gray-500 text-sm">{product.farmer.farm_location}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Product Type</h3>
                <p className="text-gray-600">{product.product_type}</p>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="quantity" className="text-gray-700">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.is_available || product.stock_quantity === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
