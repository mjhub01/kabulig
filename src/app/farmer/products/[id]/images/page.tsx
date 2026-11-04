"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface ProductImage {
  id: string
  image_url: string
  alt_text: string | null
  order: number
}

export default function ProductImagesPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [altText, setAltText] = useState("")

  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    loadImages()
  }, [session, router, params.id])

  const loadImages = async () => {
    try {
      const response = await fetch(`/api/farmer/products/${params.id}/images`)
      const data = await response.json()
      if (response.ok) {
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to load images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("altText", altText)

      const response = await fetch(`/api/farmer/products/${params.id}/images`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setSelectedFile(null)
        setAltText("")
        loadImages()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("An error occurred while uploading the image")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return
    }

    try {
      const response = await fetch(`/api/farmer/products/${params.id}/images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadImages()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete image")
      }
    } catch (error) {
      console.error("Failed to delete image:", error)
      alert("An error occurred while deleting the image")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Images</h1>
          <button
            onClick={() => router.push(`/farmer/products/${params.id}/edit`)}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Back to Edit Product
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image *
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text (for accessibility)
              </label>
              <input
                id="altText"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description of the image"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>

        {/* Existing Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Images</h2>

          {images.length === 0 ? (
            <p className="text-gray-600">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || "Product image"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                  <p className="text-sm text-gray-600 mt-2 truncate">
                    {image.alt_text || "No description"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
