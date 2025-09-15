import { documents, foreigners } from '@data/mock'
import StatusBadge from '@components/StatusBadge'

export default function DocumentListPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">書類一覧</h2>
      <div className="grid gap-3">
        {documents.map((d) => {
          const person = foreigners.find(f => f.id === d.personId)
          return (
            <div key={d.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-sm text-gray-600">{person?.name} | {d.createdAt}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

