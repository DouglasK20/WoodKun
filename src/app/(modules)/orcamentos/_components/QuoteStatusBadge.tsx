import { QUOTE_STATUS_LABEL, type QuoteStatus } from "@/db/constants"
import { cn } from "@/utils/cn"

const STATUS_CLASSES: Record<QuoteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASSES[status])}>
      {QUOTE_STATUS_LABEL[status]}
    </span>
  )
}
