import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import StatusBadge from '@components/StatusBadge'
import { useAppState } from '@context/AppStateContext'
import { DOCUMENT_TYPE_LABELS } from '@utils/constants'

function isSameMonth(date: Date, compare: Date) {
  return date.getFullYear() === compare.getFullYear() && date.getMonth() === compare.getMonth()
}

function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', options ?? { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export default function Dashboard() {
  const { documents, activities, foreigners } = useAppState()

  const today = new Date()
  const submittedCount = documents.filter((doc) => doc.status === 'submitted').length
  const approvedCount = documents.filter((doc) => doc.status === 'approved').length
  const monthlyCount = documents.filter((doc) => isSameMonth(new Date(doc.createdAt), today)).length

  const latestDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const recentActivities = activities.slice(0, 6)

  const getForeignerName = (id: string) => foreigners.find((f) => f.id === id)?.name ?? '不明'

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard title="申請中" value={`${submittedCount}件`} description="現在申請中の書類数" />
        <StatsCard title="承認済み" value={`${approvedCount}件`} description="審査が完了した書類数" />
        <StatsCard
          title="今月の申請"
          value={`${monthlyCount}件`}
          description={`${formatDate(today.toISOString(), { year: 'numeric', month: '2-digit' })}の申請数`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近の書類</CardTitle>
                <CardDescription>更新日時が新しい順に表示しています。</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/documents">一覧を見る</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>書類種別</TableHead>
                  <TableHead>対象者</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>更新日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{DOCUMENT_TYPE_LABELS[doc.type]}</TableCell>
                    <TableCell>{getForeignerName(doc.foreignerId)}</TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                  </TableRow>
                ))}
                {latestDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      書類がまだ登録されていません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
            <CardDescription>最新6件の履歴です。</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="space-y-1">
                  <p className="text-sm leading-relaxed">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                </li>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">活動履歴はまだありません。</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
}

function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

