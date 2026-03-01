import { columns } from "./columns"
import { payments } from "./data"
import {
    DataTable,
    DataTableProvider,
} from "@/components/data_table"

export function HomePage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-4">Projetos</h1>
            <DataTableProvider
                name="projetos"
                data={payments}
                columns={columns}
                searchConfig={{ columnIds: ["id", "email", "status"] }}
            >
                <DataTable
                    columns={columns}
                    data={payments}
                    searchConfig={{
                        columnIds: ["id", "email", "status"],
                        placeholder: "Buscar por ID, email ou status…",
                    }}
                />
            </DataTableProvider>
        </div>
    )
}