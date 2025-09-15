import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from '@components/Button'
import FormField from '@components/FormField'
import { exportPdfFromElement } from '@utils/pdf'
import { getItem, setItem } from '@utils/storage'

type Inputs = { name: string; date: string; notes: string }

export default function InterviewReportForm() {
  const { register, handleSubmit, watch, reset } = useForm<Inputs>({
    defaultValues: getItem<Inputs>('interview:autosave') ?? {}
  })
  const onSubmit = () => alert('保存しました（モック）')
  const previewId = 'interview-report-preview'
  useEffect(() => {
    const sub = watch((values) => setItem('interview:autosave', values as Inputs))
    return () => sub.unsubscribe()
  }, [watch])
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">定期面談報告書</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <FormField label="氏名"><input className="w-full border rounded px-3 py-2" {...register('name')} /></FormField>
        <FormField label="面談日"><input type="date" className="w-full border rounded px-3 py-2" {...register('date')} /></FormField>
        <div className="sm:col-span-2">
          <FormField label="面談内容">
            <textarea className="w-full border rounded px-3 py-2 h-32" {...register('notes')} />
          </FormField>
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <Button type="button" variant="secondary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>プレビュー</Button>
          <Button type="button" onClick={() => exportPdfFromElement(previewId, 'interview-report.pdf')}>PDF出力</Button>
          <Button type="submit" variant="secondary">保存</Button>
        </div>
      </form>
      <div id={previewId} className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">プレビュー</div>
        <div>氏名: {watch('name')}</div>
        <div>面談日: {watch('date')}</div>
        <div className="whitespace-pre-wrap">{watch('notes')}</div>
      </div>
    </div>
  )
}
