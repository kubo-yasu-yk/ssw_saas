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
import { DOCUMENT_TYPE_LABELS, RESIDENCE_PERIOD_OPTIONS } from '@utils/constants'
import { createId } from '@utils/id'
import type { Document } from '@types/index'

const schema = z.object({
  foreignerId: z.string().min(1, '対象者を選択してください'),
  desiredPeriod: z.string().min(1, '希望在留期間を選択してください'),
  expiryDate: z.string().min(1, '現在の在留期限を入力してください'),
  mentor: z.string().min(1, '受入責任者を入力してください'),
  extensionReason: z.string().min(1, '更新理由を入力してください'),
})

type FormValues = z.infer<typeof schema>

export default function PeriodExtensionForm() {
  const { foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [previewData, setPreviewData] = useState<Document | null>(null)

  const defaultForeigner = foreigners[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      foreignerId: defaultForeigner?.id ?? '',
      desiredPeriod: defaultForeigner?.residencePeriod ?? RESIDENCE_PERIOD_OPTIONS[0] ?? '',
      expiryDate: '',
      mentor: '',
      extensionReason: '',
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
      type: 'period_extension',
      title: DOCUMENT_TYPE_LABELS.period_extension,
      status: 'submitted',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        desiredPeriod: values.desiredPeriod,
        expiryDate: values.expiryDate,
        mentor: values.mentor,
        extensionReason: values.extensionReason,
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
      type: 'period_extension',
      title: DOCUMENT_TYPE_LABELS.period_extension,
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
          <h1 className="text-2xl font-semibold">{DOCUMENT_TYPE_LABELS.period_extension}</h1>
          <p className="text-sm text-muted-foreground">在留期間更新許可申請に必要な情報を入力します。</p>
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
              <CardDescription>更新対象の在留カード情報を確認してください。</CardDescription>
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
                  <p className="text-muted-foreground">現在の在留期間: {selectedForeigner.residencePeriod}</p>
                  <p className="text-muted-foreground">在留資格: {selectedForeigner.residenceStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">更新内容</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="desiredPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>希望在留期間</FormLabel>
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
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>現在の在留期限</FormLabel>
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
                name="extensionReason"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>更新理由</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="更新理由と今後の就労計画" {...field} />
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
                      <span className="font-medium">希望在留期間:</span> {String(data.desiredPeriod ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">現在の在留期限:</span> {String(data.expiryDate ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">受入責任者:</span> {String(data.mentor ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">更新理由:</span> {String(data.extensionReason ?? '')}
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
