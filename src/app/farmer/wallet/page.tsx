"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  created_at: string
}

export default function FarmerWalletPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    loadWalletData()
  }, [session, router])

  const loadWalletData = async () => {
    try {
      const response = await fetch("/api/farmer/wallet")
      const data = await response.json()

      if (response.ok) {
        setWalletBalance(data.walletBalance || 0)
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md p-8 mb-8 text-white max-w-2xl">
        <p className="text-green-100 mb-2">Available Balance</p>
        <p className="text-4xl font-bold mb-4">₱{walletBalance.toFixed(2)}</p>
        <button className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
          Request Withdrawal
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.type === "CREDIT"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "CREDIT" ? "+" : "-"}₱
                  {transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
