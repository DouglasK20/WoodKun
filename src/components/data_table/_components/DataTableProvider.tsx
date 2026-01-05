import { ColumnDef, ColumnPinningState, SortingState, Table } from "@tanstack/react-table";
import { createContext, ReactNode } from "react";

type TableContextProps<TData> = {
    table: Table<TData>;
    cleanSorting: () => void;
    cleanPagination: () => void;
};

type TableProviderProps<TData> = {
    children: ReactNode;
    name: string;
    data: TData[];
    columns: ColumnDef<TData>[];
    defaultSorting: SortingState;
    defaultColumnPinning: ColumnPinningState;
};

const TableContext = createContext<TableContextProps<any> | undefined>(undefined);

export function DataTableProvider<TData>({
    children,
    name,
    data,
    columns,
    defaultSorting,
    defaultColumnPinning,
}: TableProviderProps<TData>) {
    return <TableContext.Provider value={{ table, cleanSorting, cleanPagination }}>{children}</TableContext.Provider>
}
