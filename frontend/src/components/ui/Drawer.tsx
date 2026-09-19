import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: 'right' | 'left' | 'bottom'
  title?: React.ReactNode
  children: React.ReactNode
  maxWidth?: 'lg' | 'md' | 'xl' | 'full'
}

const maxWidthClasses: Record<NonNullable<DrawerProps['maxWidth']>, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

const sidePositionClasses: Record<NonNullable<DrawerProps['side']>, string> = {
  right:
    'top-0 bottom-0 right-0 w-full lg:w-auto border-l animate-slide-in-right',
  left:
    'top-0 bottom-0 left-0 w-full lg:w-auto border-r animate-slide-in-right',
  bottom:
    'bottom-0 left-0 right-0 h-auto max-h-[85vh] border-t rounded-t-2xl',
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  side = 'right',
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    if (!open) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const isHorizontal = side === 'left' || side === 'right'
  const horizontalWidth = isHorizontal
    ? `w-full ${maxWidthClasses[maxWidth]}`
    : ''

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`fixed bg-white shadow-xl flex flex-col ${sidePositionClasses[side]} ${horizontalWidth}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="font-semibold text-slate-900 truncate pr-4">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default Drawer
