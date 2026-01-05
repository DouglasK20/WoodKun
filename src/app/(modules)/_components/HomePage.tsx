import { columns } from "./columns";
import { payments } from "./data";
import { DataTable } from "../../../components/data_table/DataTable";

export function HomePage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-4">Home</h1>
            <DataTable columns={columns} data={payments} />
        </div>
    )
}