import React from 'react'
import { Circle, UserCircle, XCircle } from 'lucide-react'
import type { VolunteerAvailability } from '../../types/rahat'

interface AvailabilityBadgeProps {
  availability: VolunteerAvailability
  size?: 'sm' | 'md'
}

const availabilityConfig: Record<
  VolunteerAvailability,
  {
    label: string
    bg: string
    text: string
    ring: string
    icon: React.FC<{ className?: string }>
  }
> = {
  AVAILABLE: {
    label: 'Available',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    icon: Circle,
  },
  BUSY: {
    label: 'Busy',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    icon: UserCircle,
  },
  OFFLINE: {
    label: 'Offline',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    ring: 'ring-slate-200',
    icon: XCircle,
  },
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availability,
  size = 'sm',
}) => {
  const config = availabilityConfig[availability]
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
      <Icon className={`${iconSize} ${availability === 'AVAILABLE' ? 'fill-current' : ''}`} />
      <span>{config.label}</span>
    </span>
  )
}

export default AvailabilityBadge
