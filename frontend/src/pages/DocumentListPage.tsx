import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import StatusBadge from '@components/StatusBadge'
import { toast } from '@components/ui/use-toast'
import { useAppDispatch, useAppState } from '@context/AppStateContext'
import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ROUTES } from '@utils/constants'
import type { Document, DocumentStatus, DocumentType } from '@types/index'

const statusOptions: Array<'all' | DocumentStatus> = ['all', 'draft', 'submitted', 'approved', 'rejected']
const typeOptions: Array<'all' | DocumentType> = ['all', ...Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]]

type FiltersForm = {
  type: (typeof typeOptions)[number]
  status: (typeof statusOptions)[number]
}

export default function DocumentListPage() {
  const { documents, foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const form = useForm<FiltersForm>({
    defaultValues: { type: 'all', status: 'all' },
  })

  const filters = form.watch()

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const typeMatch = filters.type === 'all' || doc.type === filters.type
      const statusMatch = filters.status === 'all' || doc.status === filters.status
      return typeMatch && statusMatch
    })
  }, [documents, filters])

  const getForeignerName = (id: string) => foreigners.find((f) => f.id === id)?.name ?? '不明'

  const handleDelete = () => {
    if (!selectedDocument) return

    dispatch({ type: 'DELETE_DOCUMENT', documentId: selectedDocument.id })
    toast({ title: '書類を削除しました', description: '一覧を更新しました。' })
    setSelectedDocument(null)
  }

  const handleExportPdf = (doc: Document) => {
    toast({ title: 'PDF出力はモックです', description: `${DOCUMENT_TYPE_LABELS[doc.type]} のPDFを想定しています。` })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>書類一覧</CardTitle>
          <CardDescription>書類種別やステータスで絞り込みができます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>書類種別</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="すべて" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'all'
                              ? 'すべて'
                              : DOCUMENT_TYPE_LABELS[option as DocumentType]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="すべて" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'all'
                              ? 'すべて'
                              : DOCUMENT_STATUS_LABELS[option as DocumentStatus]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>書類種別</TableHead>
                  <TableHead>対象者</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{DOCUMENT_TYPE_LABELS[doc.type]}</TableCell>
                    <TableCell>{getForeignerName(doc.foreignerId)}</TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell>{doc.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={DOCUMENT_TYPE_ROUTES[doc.type]}>編集</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExportPdf(doc)}>
                          PDF
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setSelectedDocument(doc)}>
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      条件に一致する書類がありません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>書類を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。書類「
              {selectedDocument ? DOCUMENT_TYPE_LABELS[selectedDocument.type] : ''}
              」を削除します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

