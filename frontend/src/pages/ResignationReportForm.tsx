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
import { DOCUMENT_TYPE_LABELS } from '@utils/constants'
import { createId } from '@utils/id'
import type { Document } from '@types/index'

const schema = z.object({
  foreignerId: z.string().min(1, '対象者を選択してください'),
  resignationDate: z.string().min(1, '退職日を入力してください'),
  reason: z.string().min(1, '退職理由を入力してください'),
  transferPlan: z.string().optional(),
  authoritiesNotified: z.enum(['yes', 'no'], { required_error: '届出状況を選択してください' }),
})

type FormValues = z.infer<typeof schema>

export default function ResignationReportForm() {
  const { foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [previewData, setPreviewData] = useState<Document | null>(null)

  const defaultForeigner = foreigners[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      foreignerId: defaultForeigner?.id ?? '',
      resignationDate: '',
      reason: '',
      transferPlan: '',
      authoritiesNotified: 'no',
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
      type: 'resignation_report',
      title: DOCUMENT_TYPE_LABELS.resignation_report,
      status: 'submitted',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        ...values,
      },
    }

    dispatch({ type: 'ADD_DOCUMENT', payload })
    toast({ title: '報告書を保存しました', description: `${selectedForeigner.name} / ${payload.title}` })
  }

  const handlePreview = () => {
    if (!selectedForeigner) {
      toast({ title: '対象者を選択してください', variant: 'destructive' })
      return
    }
    const now = new Date().toISOString()
    setPreviewData({
      id: 'preview',
      type: 'resignation_report',
      title: DOCUMENT_TYPE_LABELS.resignation_report,
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
          <h1 className="text-2xl font-semibold">{DOCUMENT_TYPE_LABELS.resignation_report}</h1>
          <p className="text-sm text-muted-foreground">退職・転籍等の随時報告に必要な情報を入力します。</p>
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
              <CardDescription>退職・転籍予定の外国人を選択してください。</CardDescription>
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
                  <p className="text-muted-foreground">職種: {selectedForeigner.workCategory}</p>
                  <p className="text-muted-foreground">在留資格: {selectedForeigner.residenceStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">退職情報</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="resignationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>退職日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authoritiesNotified"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>行政への届出状況</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">届出済み</SelectItem>
                        <SelectItem value="no">未届出</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>退職理由</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="本人理由・会社都合など" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transferPlan"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>今後の受入予定</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="転籍先紹介や帰国手配などの対応予定" {...field} />
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
                <span className="font-medium">対象者:</span> {selectedForeigner.name}
              </p>
              {(() => {
                const data = previewData.data as Record<string, unknown>
                return (
                  <>
                    <p>
                      <span className="font-medium">退職日:</span> {String(data.resignationDate ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">退職理由:</span> {String(data.reason ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">行政届出状況:</span> {String(data.authoritiesNotified === 'yes' ? '届出済み' : '未届出')}
                    </p>
                    {data.transferPlan && (
                      <p>
                        <span className="font-medium">今後の対応:</span> {String(data.transferPlan)}
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

