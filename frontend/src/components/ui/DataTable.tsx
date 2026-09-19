import React from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T, col: Column<T>) => React.ReactNode
  className?: string
  stickyFirst?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: string | ((row: T) => string)
  onRowClick?: (row: T) => void
  className?: string
  selectedRowKey?: string | null
  selectedClass?: string
}

function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  rowKey,
  onRowClick,
  className = '',
  selectedRowKey,
  selectedClass = 'bg-blue-50 ring-1 ring-inset ring-blue-200',
}: DataTableProps<T>) {
  const getKey = (row: T, idx: number): string => {
    if (typeof rowKey === 'function') return rowKey(row)
    return String(row[rowKey] ?? idx)
  }

  const hasStickyFirst = columns.some((c) => c.stickyFirst)

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 border-y border-slate-200">
          <tr>
            {columns.map((col, colIdx) => {
              const isSticky = hasStickyFirst && colIdx === 0 && col.stickyFirst
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap ${
                    isSticky ? 'sticky left-0 bg-slate-50 z-10 shadow-sm' : ''
                  } ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-slate-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => {
              const rk = getKey(row, rowIdx)
              const isSelected = selectedRowKey && selectedRowKey === rk
              return (
                <tr
                  key={rk}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-slate-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? selectedClass : ''}`}
                >
                  {columns.map((col, colIdx) => {
                    const isSticky =
                      hasStickyFirst && colIdx === 0 && col.stickyFirst
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap ${
                          isSticky
                            ? 'sticky left-0 bg-white z-10 group-hover:bg-slate-50 shadow-[inset_-1px_0_0_0_theme(colors.slate.200)]'
                            : ''
                        } ${col.className ?? ''}`}
                      >
                        {col.render
                          ? col.render(row, col)
                          : (row[col.key as keyof T] as React.ReactNode)}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
