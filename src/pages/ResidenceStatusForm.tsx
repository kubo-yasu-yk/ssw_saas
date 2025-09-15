import { useForm } from 'react-hook-form'
import Button from '@components/Button'
import FormField from '@components/FormField'
import { exportPdfFromElement } from '@utils/pdf'

type Inputs = {
  name: string
  dob: string
  nationality: string
  status: string
  period: string
}

export default function ResidenceStatusForm() {
  const { register, handleSubmit, watch } = useForm<Inputs>()
  const onSubmit = () => alert('下書きとして保存しました（モック）')
  const previewId = 'residence-cert-preview'
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">在留資格認定証明書交付申請書</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <FormField label="氏名"><input className="w-full border rounded px-3 py-2" {...register('name')} /></FormField>
        <FormField label="生年月日"><input type="date" className="w-full border rounded px-3 py-2" {...register('dob')} /></FormField>
        <FormField label="国籍"><input className="w-full border rounded px-3 py-2" {...register('nationality')} /></FormField>
        <FormField label="在留資格"><input className="w-full border rounded px-3 py-2" {...register('status')} /></FormField>
        <FormField label="在留期間"><input className="w-full border rounded px-3 py-2" {...register('period')} /></FormField>
        <div className="sm:col-span-2 flex gap-2">
          <Button type="button" variant="secondary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>プレビュー</Button>
          <Button type="button" onClick={() => exportPdfFromElement(previewId, 'residence-cert.pdf')}>PDF出力</Button>
          <Button type="submit" variant="secondary">保存</Button>
        </div>
      </form>
      <div id={previewId} className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">プレビュー</div>
        <div>氏名: {watch('name')}</div>
        <div>生年月日: {watch('dob')}</div>
        <div>国籍: {watch('nationality')}</div>
        <div>在留資格: {watch('status')}</div>
        <div>在留期間: {watch('period')}</div>
      </div>
    </div>
  )
}

