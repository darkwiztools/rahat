import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { InventoryStatus } from '../../types/rahat'

interface InventoryStatusBadgeProps {
  status: InventoryStatus
  size?: 'sm' | 'md'
}

const inventoryConfig: Record<
  InventoryStatus,
  {
    label: string
    bg: string
    text: string
    ring: string
    icon: React.FC<{ className?: string }>
  }
> = {
  Available: {
    label: 'Available',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    icon: CheckCircle2,
  },
  Low: {
    label: 'Low Stock',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    icon: AlertTriangle,
  },
  'Out of Stock': {
    label: 'Out of Stock',
    bg: 'bg-red-100',
    text: 'text-red-700',
    ring: 'ring-red-200',
    icon: XCircle,
  },
}

const InventoryStatusBadge: React.FC<InventoryStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const config = inventoryConfig[status]
  const Icon = config.icon

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : 'px-2.5 py-1 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md ring-1 ring-inset ${config.bg} ${config.text} ${config.ring} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  )
}

export default InventoryStatusBadge
