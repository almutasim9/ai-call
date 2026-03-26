'use client'

import { useState } from 'react'
import { updateTenantStatus } from './actions'

interface Props {
  tenantId: string
  currentStatus: string
}

export function TenantActions({ tenantId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const isSuspended = currentStatus === 'suspended'

  const handleToggle = async () => {
    setLoading(true)
    try {
      await updateTenantStatus(tenantId, isSuspended ? 'active' : 'suspended')
    } catch (err) {
      console.error('Failed to update tenant status:', err)
      alert('Action failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`transition-colors font-bold disabled:opacity-50 ${
        isSuspended
          ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300'
          : 'text-rose-500 dark:text-rose-400/60 hover:text-rose-600 dark:hover:text-rose-400'
      }`}
    >
      {loading ? 'Updating...' : isSuspended ? 'Activate' : 'Suspend'}
    </button>
  )
}
