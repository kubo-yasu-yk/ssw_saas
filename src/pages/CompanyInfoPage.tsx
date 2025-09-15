import { useEffect, useState } from 'react'
import { company as sample } from '@data/mock'
import type { Company } from '@types/index'
import { getItem, setItem } from '@utils/storage'
import Button from '@components/Button'
import FormField from '@components/FormField'

export default function CompanyInfoPage() {
  const [data, setData] = useState<Company>(sample)

  useEffect(() => {
    const saved = getItem<Company>('company:data')
    if (saved) setData(saved)
  }, [])

  const save = () => setItem('company:data', data)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">会社情報</h2>
      <div className="bg-white p-4 rounded shadow grid sm:grid-cols-2 gap-4">
        <FormField label="会社名">
          <input className="w-full border rounded px-3 py-2" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
        </FormField>
        <FormField label="住所">
          <input className="w-full border rounded px-3 py-2" value={data.address} onChange={e => setData({ ...data, address: e.target.value })} />
        </FormField>
        <FormField label="担当者名">
          <input className="w-full border rounded px-3 py-2" value={data.contactName} onChange={e => setData({ ...data, contactName: e.target.value })} />
        </FormField>
        <FormField label="メール">
          <input className="w-full border rounded px-3 py-2" value={data.contactEmail} onChange={e => setData({ ...data, contactEmail: e.target.value })} />
        </FormField>
        <FormField label="電話番号">
          <input className="w-full border rounded px-3 py-2" value={data.contactPhone} onChange={e => setData({ ...data, contactPhone: e.target.value })} />
        </FormField>
        <div className="flex items-end">
          <Button onClick={save}>保存</Button>
        </div>
      </div>
    </div>
  )
}

