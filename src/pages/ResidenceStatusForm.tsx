import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/ui/use-toast'
import { useAppDispatch, useAppState } from '@context/AppStateContext'
import { DOCUMENT_TYPE_LABELS, RESIDENCE_PERIOD_OPTIONS, RESIDENCE_STATUS_OPTIONS, WORK_CATEGORY_OPTIONS } from '@utils/constants'
import { createId } from '@utils/id'
import type { Document } from '@types/index'

const schema = z.object({
  foreignerId: z.string().min(1, '対象者を選択してください'),
  workCategory: z.string().min(1, '職種を選択してください'),
  workStartDate: z.string().min(1, '就労開始予定日を入力してください'),
  supervisor: z.string().min(1, '責任者名を入力してください'),
  notes: z.string().optional(),
  residenceStatus: z.string().min(1, '在留資格を選択してください'),
  residencePeriod: z.string().min(1, '在留期間を選択してください'),
})

type FormValues = z.infer<typeof schema>

export default function ResidenceStatusForm() {
  const { foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [previewData, setPreviewData] = useState<Document | null>(null)

  const defaultForeigner = foreigners[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      foreignerId: defaultForeigner?.id ?? '',
      workCategory: defaultForeigner?.workCategory ?? '',
      workStartDate: '',
      supervisor: '',
      notes: '',
      residenceStatus: defaultForeigner?.residenceStatus ?? '',
      residencePeriod: defaultForeigner?.residencePeriod ?? '',
    },
  })

  const foreignerId = form.watch('foreignerId')
  const selectedForeigner = foreigners.find((f) => f.id === foreignerId)

  const handleSubmit = (values: FormValues) => {
    if (!selectedForeigner) {
      toast({ title: '対象者を選択してください', variant: 'destructive' })
      return
    }

    const now = new Date().toISOString()
    const payload: Document = {
      id: createId(),
      type: 'residence_status',
      title: DOCUMENT_TYPE_LABELS.residence_status,
      status: 'draft',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        workCategory: values.workCategory,
        workStartDate: values.workStartDate,
        supervisor: values.supervisor,
        notes: values.notes,
        residenceStatus: values.residenceStatus,
        residencePeriod: values.residencePeriod,
      },
    }

    dispatch({ type: 'ADD_DOCUMENT', payload })
    toast({ title: '下書きを保存しました', description: `${selectedForeigner.name} / ${payload.title}` })
  }

  const handlePreview = () => {
    if (!selectedForeigner) {
      toast({ title: '対象者を選択してください', variant: 'destructive' })
      return
    }
    const currentValues = form.getValues()
    const now = new Date().toISOString()
    setPreviewData({
      id: 'preview',
      type: 'residence_status',
      title: DOCUMENT_TYPE_LABELS.residence_status,
      status: 'draft',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        ...currentValues,
      },
    })
  }

  const handlePdf = () => {
    toast({ title: 'PDF出力はモックです', description: 'このモックではPDFは生成されません。' })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{DOCUMENT_TYPE_LABELS.residence_status}</h1>
          <p className="text-sm text-muted-foreground">特定技能外国人の在留資格認定証明書交付申請に使用する情報を入力します。</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/documents">書類一覧へ</Link>
        </Button>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">対象者</CardTitle>
              <CardDescription>申請対象となる特定技能外国人を選択してください。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="foreignerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>対象者</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foreigners.map((foreigner) => (
                          <SelectItem key={foreigner.id} value={foreigner.id}>
                            {foreigner.name}（{foreigner.nationality}）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedForeigner && (
                <div className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{selectedForeigner.name}</p>
                  <p className="text-muted-foreground">{selectedForeigner.nameKana}</p>
                  <p className="mt-1 text-muted-foreground">
                    国籍: {selectedForeigner.nationality} / 生年月日: {selectedForeigner.birthDate}
                  </p>
                  <p className="text-muted-foreground">旅券番号: {selectedForeigner.passportNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">在留資格情報</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="residenceStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>在留資格</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RESIDENCE_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="residencePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>在留期間</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RESIDENCE_PERIOD_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">受入機関情報</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="workCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>職種</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORK_CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>就労開始予定日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supervisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>担当責任者</FormLabel>
                    <FormControl>
                      <Input placeholder="担当責任者名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>備考</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="補足事項や確認メモ" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handlePreview}>
              プレビュー
            </Button>
            <Button type="button" variant="outline" onClick={handlePdf}>
              PDF出力
            </Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Form>

      <Dialog open={!!previewData} onOpenChange={(open) => !open && setPreviewData(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>プレビュー</DialogTitle>
            <DialogDescription>入力内容を確認してください。</DialogDescription>
          </DialogHeader>
          {previewData && selectedForeigner && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">対象者:</span> {selectedForeigner.name}（{selectedForeigner.nationality}）
              </p>
              {(() => {
                const data = previewData.data as Record<string, unknown>
                return (
                  <>
                    <p>
                      <span className="font-medium">在留資格:</span> {String(data.residenceStatus ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">在留期間:</span> {String(data.residencePeriod ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">職種:</span> {String(data.workCategory ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">就労開始予定日:</span> {String(data.workStartDate ?? '')}
                    </p>
                    {data.notes && (
                      <p>
                        <span className="font-medium">備考:</span> {String(data.notes)}
                      </p>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
