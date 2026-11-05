"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface FarmerSidebarProps {
  children: React.ReactNode
}

export function FarmerSidebar({ children }: FarmerSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/farmer/orders", label: "Dashboard", icon: "📊" },
    { href: "/farmer/products", label: "My Products", icon: "🌾" },
    { href: "/farmer/products/new", label: "Add Product", icon: "➕" },
    { href: "/farmer/crops", label: "Crop Cycles", icon: "🌱" },
    { href: "/farmer/wallet", label: "My Wallet", icon: "💰" },
    { href: "/farmer/profile", label: "My Profile", icon: "👤" },
  ]

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md min-h-screen fixed left-0 top-0">
        <div className="p-6">
          <Link href="/" className="flex items-center">
            <img src="/kabulig.png" alt="Kabulig" className="h-10 w-auto" />
          </Link>
          <p className="text-sm text-gray-600 mt-2">Farmer Dashboard</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 transition-colors ${
                pathname === item.href
                  ? "bg-green-50 text-green-700 border-r-4 border-green-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-700"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <Link
            href="/products"
            className="flex items-center text-gray-700 hover:text-green-700 transition-colors"
          >
            <span className="mr-3">🏠</span>
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
