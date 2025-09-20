import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/ui/use-toast'
import { useAppDispatch, useAppState } from '@context/AppStateContext'
import { NATIONALITY_OPTIONS, RESIDENCE_PERIOD_OPTIONS, RESIDENCE_STATUS_OPTIONS, WORK_CATEGORY_OPTIONS } from '@utils/constants'

const schema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  nameKana: z.string().min(1, '氏名（カナ）は必須です'),
  nationality: z.string().min(1, '国籍は必須です'),
  birthDate: z.string().min(1, '生年月日は必須です'),
  passportNumber: z.string().min(1, '旅券番号は必須です'),
  residenceStatus: z.string().min(1, '在留資格は必須です'),
  residencePeriod: z.string().min(1, '在留期間は必須です'),
  workCategory: z.string().min(1, '職種は必須です'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

export default function ForeignerListPage() {
  const { foreigners } = useAppState()
  const dispatch = useAppDispatch()
  const [keyword, setKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      nameKana: '',
      nationality: '',
      birthDate: '',
      passportNumber: '',
      residenceStatus: '',
      residencePeriod: '',
      workCategory: '',
      notes: '',
    },
  })

  const filtered = useMemo(() => {
    if (!keyword) return foreigners
    return foreigners.filter((f) =>
      [f.name, f.nameKana, f.nationality, f.passportNumber]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword.toLowerCase()))
    )
  }, [foreigners, keyword])

  const handleAdd = (values: FormValues) => {
    dispatch({
      type: 'ADD_FOREIGNER',
      payload: {
        id: createId(),
        companyId: foreigners[0]?.companyId ?? 'c1',
        name: values.name,
        nameKana: values.nameKana,
        nationality: values.nationality,
        birthDate: values.birthDate,
        passportNumber: values.passportNumber,
        residenceStatus: values.residenceStatus,
        residencePeriod: values.residencePeriod,
        workCategory: values.workCategory,
        notes: values.notes?.trim() ? values.notes : undefined,
      },
    })
    toast({ title: '外国人情報を追加しました', description: values.name })
    form.reset()
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>特定技能外国人一覧</CardTitle>
              <CardDescription>登録済みの特定技能外国人の情報を確認できます。</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>新規登録</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>外国人情報の追加</DialogTitle>
                  <DialogDescription>在留資格関連の管理に必要な基本情報を入力してください。</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>氏名</FormLabel>
                          <FormControl>
                            <Input placeholder="山田 太郎" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameKana"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>氏名（カナ）</FormLabel>
                          <FormControl>
                            <Input placeholder="やまだ たろう" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>国籍</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {NATIONALITY_OPTIONS.map((option) => (
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
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>生年月日</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="passportNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>旅券番号</FormLabel>
                          <FormControl>
                            <Input placeholder="AB1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
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
                    </div>
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>備考</FormLabel>
                          <FormControl>
                            <Textarea placeholder="現地での対応状況など" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button type="submit">登録する</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="氏名・カナ・国籍・旅券番号で検索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>カナ</TableHead>
                  <TableHead>国籍</TableHead>
                  <TableHead>在留資格</TableHead>
                  <TableHead>在留期間</TableHead>
                  <TableHead>職種</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.nameKana}</TableCell>
                    <TableCell>{f.nationality}</TableCell>
                    <TableCell>{f.residenceStatus}</TableCell>
                    <TableCell>{f.residencePeriod}</TableCell>
                    <TableCell>{f.workCategory}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      該当する外国人が見つかりませんでした。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

