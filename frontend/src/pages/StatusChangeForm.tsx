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
import { DOCUMENT_TYPE_LABELS, RESIDENCE_STATUS_OPTIONS } from '@utils/constants'
import { createId } from '@utils/id'
import type { Document } from '@types/index'

const schema = z.object({
  foreignerId: z.string().min(1, '対象者を選択してください'),
  desiredStatus: z.string().min(1, '希望する在留資格を選択してください'),
  changeReason: z.string().min(1, '変更理由を入力してください'),
  expectedStartDate: z.string().min(1, '変更予定日を入力してください'),
  mentor: z.string().min(1, '受入責任者を入力してください'),
})

type FormValues = z.infer<typeof schema>

export default function StatusChangeForm() {
  const { foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [previewData, setPreviewData] = useState<Document | null>(null)

  const defaultForeigner = foreigners[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      foreignerId: defaultForeigner?.id ?? '',
      desiredStatus: defaultForeigner?.residenceStatus ?? RESIDENCE_STATUS_OPTIONS[0] ?? '',
      changeReason: '',
      expectedStartDate: '',
      mentor: '',
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
      type: 'status_change',
      title: DOCUMENT_TYPE_LABELS.status_change,
      status: 'submitted',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        desiredStatus: values.desiredStatus,
        changeReason: values.changeReason,
        expectedStartDate: values.expectedStartDate,
        mentor: values.mentor,
      },
    }

    dispatch({ type: 'ADD_DOCUMENT', payload })
    toast({ title: '申請を保存しました', description: `${selectedForeigner.name} / ${payload.title}` })
  }

  const handlePreview = () => {
    if (!selectedForeigner) {
      toast({ title: '対象者を選択してください', variant: 'destructive' })
      return
    }
    const now = new Date().toISOString()
    setPreviewData({
      id: 'preview',
      type: 'status_change',
      title: DOCUMENT_TYPE_LABELS.status_change,
      status: 'draft',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        ...form.getValues(),
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
          <h1 className="text-2xl font-semibold">{DOCUMENT_TYPE_LABELS.status_change}</h1>
          <p className="text-sm text-muted-foreground">在留資格変更許可申請に必要な情報を入力します。</p>
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
              <CardDescription>現在の在留資格と変更後の情報を確認してください。</CardDescription>
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
                  <p className="text-muted-foreground">現行在留資格: {selectedForeigner.residenceStatus}</p>
                  <p className="text-muted-foreground">在留期間: {selectedForeigner.residencePeriod}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">変更内容</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="desiredStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>変更後の在留資格</FormLabel>
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
                name="expectedStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>変更予定日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mentor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>受入責任者</FormLabel>
                    <FormControl>
                      <Input placeholder="担当責任者名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="changeReason"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>変更理由</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="変更理由と今後の予定" {...field} />
                    </FormControl>
                    <FormMessage />
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
                <span className="font-medium">対象者:</span> {selectedForeigner.name}
              </p>
              {(() => {
                const data = previewData.data as Record<string, unknown>
                return (
                  <>
                    <p>
                      <span className="font-medium">変更後在留資格:</span> {String(data.desiredStatus ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">変更予定日:</span> {String(data.expectedStartDate ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">受入責任者:</span> {String(data.mentor ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">変更理由:</span> {String(data.changeReason ?? '')}
                    </p>
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

