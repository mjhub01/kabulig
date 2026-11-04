"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

export function Navbar() {
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateCartCount = () => {
      const cartData = localStorage.getItem("cart")
      const cart = cartData ? JSON.parse(cartData) : []
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
    }

    updateCartCount()
    window.addEventListener("storage", updateCartCount)
    return () => window.removeEventListener("storage", updateCartCount)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (status === "loading") {
    return null
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-green-700">
            Kabulig Portal
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-green-600 hover:text-green-700 font-semibold">
              Products
            </Link>
            <Link href="/cart" className="relative text-gray-700 hover:text-green-700">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {session ? (
              <>
                {session.user.role === "CUSTOMER" && (
                  <Link href="/orders" className="text-gray-700 hover:text-green-700 font-semibold">
                    Orders
                  </Link>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-gray-700 hover:text-green-700 font-semibold py-2"
                  >
                    {session.user.name}
                    <span className="ml-1">▼</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {session.user.role === "FARMER" && (
                        <>
                          <Link
                            href="/farmer/orders"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/farmer/products"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            My Products
                          </Link>
                          <Link
                            href="/farmer/products/new"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Add Product
                          </Link>
                          <Link
                            href="/farmer/crops"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Crop Cycles
                          </Link>
                          <Link
                            href="/farmer/wallet"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            My Wallet
                          </Link>
                          <Link
                            href="/farmer/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Profile
                          </Link>
                        </>
                      )}
                      {session.user.role === "CUSTOMER" && (
                        <>
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/customer/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            href="/customer/addresses"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            Addresses
                          </Link>
                        </>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          signOut()
                          setShowDropdown(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
