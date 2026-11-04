import { FarmerSidebar } from "@/components/FarmerSidebar"

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <FarmerSidebar>{children}</FarmerSidebar>
    </div>
  )
}
