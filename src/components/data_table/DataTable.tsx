"use client"

import type { FilterFn } from "@tanstack/react-table"
import type { Row, Table as TableType } from "@tanstack/react-table"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import React, { useMemo, useState } from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { useDataTableContext } from "./_components/DataTableProvider"

type SearchConfig = {
    placeholder?: string
    columnId?: string
    columnIds?: string[]
    filterFn?: FilterFn<unknown>
}

type SortConfig = {
    defaultSorting?: { id: string; desc: boolean }[]
    enableMultiSort?: boolean
}

type PaginationConfig = {
    pageSize?: number
    pageSizeOptions?: number[]
}

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    name?: string
    searchConfig?: SearchConfig
    sortConfig?: SortConfig
    paginationConfig?: PaginationConfig
    showSearch?: boolean
    showPagination?: boolean
    emptyMessage?: string
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

type DataTableViewProps<TData> = {
    table: TableType<TData>
    columns: ColumnDef<TData, unknown>[]
    searchConfig?: SearchConfig
    showSearch: boolean
    showPagination: boolean
    emptyMessage: string
}

function DataTableView<TData>({
    table,
    columns,
    searchConfig,
    showSearch,
    showPagination,
    emptyMessage,
}: DataTableViewProps<TData>) {
    const filterColumnIds = useMemo(() => {
        if (searchConfig?.columnIds?.length) return searchConfig.columnIds
        if (searchConfig?.columnId) return [searchConfig.columnId]
        return []
    }, [searchConfig])

    const searchPlaceholder = searchConfig?.placeholder ?? "Buscar…"
    const hasSearchColumns = filterColumnIds.length > 0
    const globalFilter = table.getState().globalFilter ?? ""

    return (
        <div className="space-y-4">
            {showSearch && hasSearchColumns && (
                <div className="flex items-center py-4">
                    <DataTableToolbar
                        value={globalFilter}
                        onChange={(v) => table.setGlobalFilter(v)}
                        placeholder={searchPlaceholder}
                    />
                </div>
            )}
            <div className="overflow-hidden rounded-lg border border-wood-border bg-wood-background">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-wood-border hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="bg-wood-muted/50 border-b-2 border-wood-border font-medium"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    className="border-wood-border hover:bg-wood-muted/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="border-wood-border"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {showPagination && (
                <DataTablePagination table={table} />
            )}
        </div>
    )
}

function DataTableStandalone<TData, TValue>({
    columns,
    data,
    searchConfig,
    sortConfig,
    paginationConfig = {},
    showSearch = true,
    showPagination = true,
    emptyMessage = "Nenhum resultado encontrado.",
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState(sortConfig?.defaultSorting ?? [])
    const [globalFilter, setGlobalFilter] = useState("")

    const filterColumnIds = useMemo(() => {
        if (searchConfig?.columnIds?.length) return searchConfig.columnIds
        if (searchConfig?.columnId) return [searchConfig.columnId]
        return []
    }, [searchConfig])

    const globalFilterFn = useMemo(() => {
        if (searchConfig?.filterFn) return searchConfig.filterFn as Parameters<typeof useReactTable<TData>>[0]["globalFilterFn"]
        if (filterColumnIds.length > 0) {
            return createMultiColumnFilter<TData>(filterColumnIds)
        }
        return "includesString" as const
    }, [searchConfig, filterColumnIds])

    const { pageSize = 10 } = paginationConfig

    const table = useReactTable<TData>({
        data,
        columns: columns as ColumnDef<TData, unknown>[],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        initialState: {
            pagination: { pageIndex: 0, pageSize },
        },
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    })

    return (
        <DataTableView
            table={table}
            columns={columns as ColumnDef<TData, unknown>[]}
            searchConfig={searchConfig}
            showSearch={showSearch}
            showPagination={showPagination}
            emptyMessage={emptyMessage}
        />
    )
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
    const context = useDataTableContext<TData>()

    if (context) {
        return (
            <DataTableView
                table={context.table}
                columns={props.columns as ColumnDef<TData, unknown>[]}
                searchConfig={props.searchConfig}
                showSearch={props.showSearch ?? true}
                showPagination={props.showPagination ?? true}
                emptyMessage={props.emptyMessage ?? "Nenhum resultado encontrado."}
            />
        )
    }

    return <DataTableStandalone {...props} />
}
