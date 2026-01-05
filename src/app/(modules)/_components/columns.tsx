"use client"

import { cn } from "@/libs/cn"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "id",
        header: "ID",
        sortDescFirst: true,
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.original.status;
            const statusColor: Record<string, string> = {
                pending: "bg-yellow-500",
                processing: "bg-blue-500",
                success: "bg-green-500",
                failed: "bg-red-500",
            }

            return <span className={cn("text-center px-2 py-1 rounded-md text-xs font-medium", statusColor[status])}>{status}</span>
        }
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-center">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-center font-medium">{formatted}</div>
        }
    },
]