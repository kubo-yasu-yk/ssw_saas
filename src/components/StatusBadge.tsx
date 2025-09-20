import { Badge } from '@components/ui/badge'
import type { DocumentStatus } from '@types/index'

const badgeConfig: Record<DocumentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; className?: string }> = {
  draft: { label: '下書き', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  submitted: { label: '申請中', variant: 'secondary', className: 'bg-amber-100 text-amber-800' },
  approved: { label: '承認済み', variant: 'default' },
  rejected: { label: '差戻し', variant: 'destructive' },
}

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = badgeConfig[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

