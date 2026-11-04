"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CropCycle {
  id: string
  crop_name: string
  planting_date: string
  expected_harvest_date: string
  actual_harvest_date: string | null
  yield_estimate: string | null
  status: string
  notes: string | null
}

export default function FarmerCropsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [crops, setCrops] = useState<CropCycle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    loadCrops()
  }, [session, router])

  const loadCrops = async () => {
    try {
      const response = await fetch("/api/farmer/crops")
      const data = await response.json()

      if (response.ok) {
        setCrops(data.crops || [])
      }
    } catch (error) {
      console.error("Failed to load crops:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    PLANTED: "bg-green-100 text-green-800",
    GROWING: "bg-blue-100 text-blue-800",
    HARVESTED: "bg-yellow-100 text-yellow-800",
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crop Cycles</h1>
        <Link
          href="/farmer/crops/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Crop Cycle
        </Link>
      </div>

      {crops.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl">
          <p className="text-gray-600 mb-4">No crop cycles recorded yet</p>
          <p className="text-sm text-gray-500 mb-4">Track your planting and harvest cycles here</p>
          <Link
            href="/farmer/crops/new"
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Add your first crop cycle
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {crops.map((crop) => (
            <div key={crop.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{crop.crop_name}</h3>
                  <p className="text-sm text-gray-600">
                    Planted: {new Date(crop.planting_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expected Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[crop.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {crop.status}
                </span>
              </div>

              {crop.yield_estimate && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Yield Estimate:</span> {crop.yield_estimate}
                </p>
              )}

              {crop.notes && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Notes:</span> {crop.notes}
                </p>
              )}

              {crop.actual_harvest_date && (
                <p className="text-gray-600">
                  <span className="font-medium">Actual Harvest:</span>{" "}
                  {new Date(crop.actual_harvest_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
