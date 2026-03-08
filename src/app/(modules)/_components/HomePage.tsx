import { DataTable } from "@/components/data_table/DataTable"
import { columns } from "./columns"
import { payments } from "./data"

export function HomePage() {
  return (
    <div className="space-y-4">
      <DataTable
        name="projetos"
        data={payments}
        columns={columns}
        searchConfig={{
          columnIds: ["id", "email", "status"],
          placeholder: "Buscar…",
        }}
      />
    </div>
  )
}