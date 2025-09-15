import { documents } from '@data/mock'

export default function Dashboard() {
  const submitted = documents.filter(d => d.status === 'submitted').length
  const approved = documents.filter(d => d.status === 'approved').length
  const recent = documents.slice(0, 5)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">申請中</div>
          <div className="text-3xl font-bold">{submitted}件</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">承認済み</div>
          <div className="text-3xl font-bold">{approved}件</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">今月の申請数</div>
          <div className="text-3xl font-bold">{recent.length}件</div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">最近の活動履歴</div>
        <ul className="list-disc pl-5 space-y-1">
          {recent.map(r => (
            <li key={r.id}>{r.title} を作成 ({r.createdAt})</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

