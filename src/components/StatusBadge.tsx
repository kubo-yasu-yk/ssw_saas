import type { DocumentStatus } from '@types/index'

const map: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-700',
}

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  return <span className={`text-xs px-2 py-1 rounded ${map[status]}`}>{label(status)}</span>
}

function label(s: DocumentStatus) {
  switch (s) {
    case 'draft':
      return '下書き'
    case 'submitted':
      return '申請中'
    case 'approved':
      return '承認済み'
  }
}

