"use client";
import React, { useEffect, useState } from 'react'
import { getAppUserById } from '@/service/user-service'
import { AppUser } from '@/types/user-types'
import { Skeleton } from '@/components/ui/skeleton'

interface ViewUserProps {
  id: string
}

interface Address {
  _id: string
  index: number
  nick_name: string
  street: string
  city: string
  state: string
  pincode: string
}

export default function Viewuser({ id }: ViewUserProps) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0)

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getAppUserById(id)
        console.log("🔍 User data:", res);
        if (isMounted) setUser(res.data)
      } catch (e: any) {
        if (isMounted) setError('Failed to load user')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => { isMounted = false }
  }, [id])

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>
  }

  if (!user) {
    return <div className="p-4 text-sm text-gray-600">User not found.</div>
  }

  const addresses = (user.address || []) as Address[]
  const selectedAddress = addresses[selectedAddressIndex]

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">User Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div className="p-3 border rounded">
          <div className="text-gray-500 text-sm">Email</div>
          <div className="text-gray-900">{user.email || '-'}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500 text-sm">Username</div>
          <div className="text-gray-900">{user.username || '-'}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500 text-sm">Phone</div>
          <div className="text-gray-900">{user.phone_Number || '-'}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500 text-sm">Role</div>
          <div className="text-gray-900">{user.role || 'User'}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-gray-500 text-sm">Last Login</div>
          <div className="text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</div>
        </div>
      </div>

      {addresses.length > 0 && (
        <div className="mt-6 max-w-3xl">
          <h3 className="text-lg font-semibold mb-3">Addresses</h3>
          <div className="mb-4">
            <select
              value={selectedAddressIndex}
              onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {addresses.map((addr, idx) => (
                <option key={addr._id || idx} value={idx}>
                  {addr.nick_name || `Address ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
          
          {selectedAddress && (
            <div className="p-4 border rounded bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500 text-sm">Street</div>
                  <div className="text-gray-900">{selectedAddress.street}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">City</div>
                  <div className="text-gray-900">{selectedAddress.city}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">State</div>
                  <div className="text-gray-900">{selectedAddress.state}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Pincode</div>
                  <div className="text-gray-900">{selectedAddress.pincode}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
