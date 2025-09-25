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
  interviewDate: z.string().min(1, '面談日を入力してください'),
  interviewer: z.string().min(1, '面談担当者を入力してください'),
  summary: z.string().min(1, '面談内容を入力してください'),
  issues: z.string().optional(),
  actionItems: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function InterviewReportForm() {
  const { foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [previewData, setPreviewData] = useState<Document | null>(null)

  const defaultForeigner = foreigners[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      foreignerId: defaultForeigner?.id ?? '',
      interviewDate: '',
      interviewer: '',
      summary: '',
      issues: '',
      actionItems: '',
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
      type: 'interview_report',
      title: DOCUMENT_TYPE_LABELS.interview_report,
      status: 'approved',
      foreignerId: selectedForeigner.id,
      createdAt: now,
      updatedAt: now,
      data: {
        ...selectedForeigner,
        ...values,
      },
    }

    dispatch({ type: 'ADD_DOCUMENT', payload })
    toast({ title: '面談報告を保存しました', description: `${selectedForeigner.name} / ${payload.title}` })
  }

  const handlePreview = () => {
    if (!selectedForeigner) {
      toast({ title: '対象者を選択してください', variant: 'destructive' })
      return
    }
    const now = new Date().toISOString()
    setPreviewData({
      id: 'preview',
      type: 'interview_report',
      title: DOCUMENT_TYPE_LABELS.interview_report,
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
          <h1 className="text-2xl font-semibold">{DOCUMENT_TYPE_LABELS.interview_report}</h1>
          <p className="text-sm text-muted-foreground">定期面談の内容や課題を記録します。</p>
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
              <CardDescription>面談対象となる外国人を選択してください。</CardDescription>
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
              <CardTitle className="text-lg">面談情報</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="interviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>面談日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interviewer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>面談担当者</FormLabel>
                    <FormControl>
                      <Input placeholder="担当者名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>面談内容</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="業務状況・生活面の確認内容など" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issues"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>課題・懸念事項</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="追加サポートが必要な事項など" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actionItems"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>対応方針</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="関係者への共有事項や次回面談までのタスク" {...field} />
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
                      <span className="font-medium">面談日:</span> {String(data.interviewDate ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">担当者:</span> {String(data.interviewer ?? '')}
                    </p>
                    <p>
                      <span className="font-medium">面談内容:</span> {String(data.summary ?? '')}
                    </p>
                    {data.issues && (
                      <p>
                        <span className="font-medium">課題:</span> {String(data.issues)}
                      </p>
                    )}
                    {data.actionItems && (
                      <p>
                        <span className="font-medium">対応方針:</span> {String(data.actionItems)}
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

