"use client"

import type { Row } from "@tanstack/react-table"
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  SortingState,
  Table,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY_PREFIX = "datatable-"

type PersistedState = {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnPinning: ColumnPinningState
  pagination: PaginationState
  globalFilter?: string
}

type TableContextProps<TData> = {
  table: Table<TData>
  cleanSorting: () => void
  cleanPagination: () => void
}

const TableContext = createContext<TableContextProps<unknown> | undefined>(undefined)

export function useDataTableContext<TData>() {
  const context = useContext(TableContext) as TableContextProps<TData> | undefined
  return context
}

function loadState<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function saveState(key: string, state: PersistedState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // ignore
  }
}

type SearchConfig = {
  columnId?: string
  columnIds?: string[]
}

type TableProviderProps<TData> = {
  children: React.ReactNode
  name: string
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  defaultSorting?: SortingState
  defaultColumnPinning?: ColumnPinningState
  defaultPageSize?: number
  searchConfig?: SearchConfig
}


function createMultiColumnFilter<TData>(columnIds: string[]) {
  return (row: Row<TData>, _columnId: string, filterValue: string) => {
    if (!filterValue || filterValue.trim() === "") return true
    const lower = filterValue.toLowerCase().trim()
    return columnIds.some((colId) => {
      const val = row.getValue(colId)
      return val != null && String(val).toLowerCase().includes(lower)
    })
  }
}

export function DataTableProvider<TData>({
  children,
  name,
  data,
  columns,
  defaultSorting = [],
  defaultColumnPinning = { left: [], right: [] },
  defaultPageSize = 10,
  searchConfig,
}: TableProviderProps<TData>) {
  const storageKey = `${STORAGE_KEY_PREFIX}${name}`

  const saved = loadState<PersistedState>(storageKey)

  const [sorting, setSorting] = useState<SortingState>(saved?.sorting ?? defaultSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    saved?.columnFilters ?? []
  )
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    saved?.columnPinning ?? defaultColumnPinning
  )
  const [pagination, setPagination] = useState<PaginationState>(
    saved?.pagination ?? { pageIndex: 0, pageSize: defaultPageSize }
  )
  const [globalFilter, setGlobalFilter] = useState<string>(
    saved?.globalFilter ?? ""
  )

  const filterColumnIds = useMemo(() => {
    if (searchConfig?.columnIds?.length) return searchConfig.columnIds
    if (searchConfig?.columnId) return [searchConfig.columnId]
    return []
  }, [searchConfig])

  const globalFilterFn = useMemo(() => {
    if (filterColumnIds.length > 0) {
      return createMultiColumnFilter<TData>(filterColumnIds)
    }
    return undefined
  }, [filterColumnIds])

  useEffect(() => {
    saveState(storageKey, {
      sorting,
      columnFilters,
      columnPinning,
      pagination,
      globalFilter,
    })
  }, [storageKey, sorting, columnFilters, columnPinning, pagination, globalFilter])

  const cleanSorting = useCallback(() => {
    setSorting(defaultSorting)
  }, [defaultSorting])

  const cleanPagination = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: defaultPageSize })
  }, [defaultPageSize])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })
          : updater
      setPagination(next)
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn ?? "includesString",
    state: {
      sorting,
      columnFilters,
      columnPinning,
      pagination,
      globalFilter,
    },
  })

  const value = useMemo<TableContextProps<TData>>(
    () => ({ table, cleanSorting, cleanPagination }),
    [table, cleanSorting, cleanPagination]
  )

  return (
    <TableContext.Provider value={value as TableContextProps<unknown>}>
      {children}
    </TableContext.Provider>
  )
}
