import { LoaderCircle } from "lucide-react";

export default function Loading() {
    return (
        <div className="grid place-items-center h-screen">
            <LoaderCircle className="animate-spin" />
        </div>
    )
}