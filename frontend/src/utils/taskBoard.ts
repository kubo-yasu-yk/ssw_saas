import type { Document, Foreigner, TaskCardSummary, TaskCardStatus } from '@types/index'

type DeadlineCandidate = string | number | Date | undefined | null

const DATE_KEYS = ['deadline', 'dueDate', 'due_date', 'dueOn', 'scheduledDate', 'scheduled_date']

const TODAY = () => new Date()

const parseDate = (value: DeadlineCandidate): Date | undefined => {
  if (!value) return undefined
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'number') {
    const fromNumber = new Date(value)
    return Number.isNaN(fromNumber.getTime()) ? undefined : fromNumber
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return undefined
}

const extractDeadlineFromDocument = (doc: Document): Date | undefined => {
  const data = doc.data ?? {}
  for (const key of DATE_KEYS) {
    if (key in data) {
      const candidate = parseDate((data as Record<string, unknown>)[key] as DeadlineCandidate)
      if (candidate) return candidate
    }
  }
  // fallback to updatedAt if defined
  return parseDate(doc.updatedAt ?? doc.createdAt)
}

const calculateRemainingDays = (deadline?: Date): number | undefined => {
  if (!deadline) return undefined
  const today = TODAY()
  const diff = deadline.getTime() - today.setHours(0, 0, 0, 0)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const statusFromRemainingDays = (days?: number): TaskCardStatus => {
  if (days === undefined) return 'none'
  if (days < 0) return 'overdue'
  if (days <= 3) return 'danger'
  if (days <= 7) return 'warning'
  return 'normal'
}

const formatMetaValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (value instanceof Date) return value.toISOString()
  return ''
}

const createSummary = ({
  id,
  title,
  description,
  documents,
  fallbackLink,
}: {
  id: TaskCardSummary['id']
  title: string
  description: string
  documents: Document[]
  fallbackLink: string
}): TaskCardSummary => {
  if (documents.length === 0) {
    return {
      id,
      title,
      description,
      status: 'none',
      count: 0,
      ctaHref: fallbackLink,
    }
  }

  const sortedByDeadline = [...documents].sort((a, b) => {
    const deadlineA = extractDeadlineFromDocument(a)?.getTime() ?? Infinity
    const deadlineB = extractDeadlineFromDocument(b)?.getTime() ?? Infinity
    return deadlineA - deadlineB
  })

  const nextDocument = sortedByDeadline[0]
  const deadline = extractDeadlineFromDocument(nextDocument)
  const remainingDays = calculateRemainingDays(deadline)
  const status = statusFromRemainingDays(remainingDays)

  const meta: TaskCardSummary['meta'] = []
  if (nextDocument.title) {
    meta?.push({ label: '対象書類', value: nextDocument.title })
  }
  if (deadline) {
    meta?.push({
      label: '期限',
      value: deadline.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    })
  }

  return {
    id,
    title,
    description,
    deadline: deadline?.toISOString(),
    remainingDays,
    status,
    count: documents.length,
    ctaHref: fallbackLink,
    meta: meta?.length ? meta : undefined,
  }
}

const getDocumentsByType = (documents: Document[], types: Document['type'][]): Document[] => {
  return documents.filter((doc) => types.includes(doc.type))
}

export const buildTaskSummaries = ({
  documents,
  foreigners,
}: {
  documents: Document[]
  foreigners: Foreigner[]
}): TaskCardSummary[] => {
  const regularReportDocs = getDocumentsByType(documents, ['interview_report'])
  const visaRenewalDocs = getDocumentsByType(documents, ['period_extension', 'residence_status'])
  const resignationDocs = getDocumentsByType(documents, ['resignation_report'])

  const resignationCount = resignationDocs.length || foreigners.filter((f) => f.notes?.includes('退職予定')).length

  const regularReportSummary = createSummary({
    id: 'regularReport',
    title: '定期届出',
    description: '定期届出の作成・提出状況を確認',
    documents: regularReportDocs,
    fallbackLink: '/documents',
  })

  const visaRenewalSummary = createSummary({
    id: 'visaRenewal',
    title: '在留期間更新',
    description: '在留期間更新の準備状況を確認',
    documents: visaRenewalDocs,
    fallbackLink: '/documents',
  })

  const resignationSummary = createSummary({
    id: 'resignation',
    title: '退職予定者',
    description: '退職予定者の手続き・書類の進捗を確認',
    documents: resignationDocs,
    fallbackLink: '/documents',
  })

  if (resignationCount === 0 && resignationSummary.meta) {
    resignationSummary.meta = resignationSummary.meta.filter((item) => item.label !== '対象書類')
  }

  resignationSummary.count = resignationCount

  return [regularReportSummary, visaRenewalSummary, resignationSummary]
}
