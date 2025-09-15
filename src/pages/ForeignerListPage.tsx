import { useState } from 'react'
import { foreigners as initial } from '@data/mock'
import type { Foreigner } from '@types/index'
import Button from '@components/Button'
import FormField from '@components/FormField'

export default function ForeignerListPage() {
  const [list, setList] = useState<Foreigner[]>(initial)
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('')

  const add = () => {
    if (!name) return
    setList([{ id: crypto.randomUUID(), name, dob: '2000-01-01', nationality, residenceStatus: '特定技能1号', residencePeriod: '1年' }, ...list])
    setName('')
    setNationality('')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">特定技能外国人</h2>
      <div className="bg-white p-4 rounded shadow">
        <div className="grid sm:grid-cols-3 gap-3">
          <FormField label="氏名">
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
          </FormField>
          <FormField label="国籍">
            <input className="w-full border rounded px-3 py-2" value={nationality} onChange={e => setNationality(e.target.value)} />
          </FormField>
          <div className="flex items-end">
            <Button onClick={add}>追加</Button>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {list.map(f => (
          <div key={f.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium">{f.name}</div>
            <div className="text-sm text-gray-600">{f.nationality} | {f.residenceStatus} | {f.residencePeriod}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

