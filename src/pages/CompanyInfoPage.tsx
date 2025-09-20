import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/ui/use-toast'
import { useAppDispatch, useAppState } from '@context/AppStateContext'

const schema = z.object({
  name: z.string().min(1, '会社名は必須です'),
  address: z.string().min(1, '住所は必須です'),
  representative: z.string().min(1, '代表者名は必須です'),
  phone: z.string().min(1, '電話番号は必須です'),
  registrationNumber: z.string().min(1, '登録番号は必須です'),
})

type FormValues = z.infer<typeof schema>

export default function CompanyInfoPage() {
  const { company } = useAppState()
  const dispatch = useAppDispatch()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company.name,
      address: company.address,
      representative: company.representative,
      phone: company.phone,
      registrationNumber: company.registrationNumber,
    },
  })

  const handleSubmit = (values: FormValues) => {
    dispatch({
      type: 'UPDATE_COMPANY',
      payload: {
        ...company,
        ...values,
      },
    })
    toast({ title: '会社情報を更新しました', description: '入力内容を保存しました。' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>会社情報</CardTitle>
        <CardDescription>受入機関の基本情報を管理します。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>会社名</FormLabel>
                  <FormControl>
                    <Input placeholder="サンプル受入機関株式会社" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所在地</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="東京都千代田区..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="representative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>代表者</FormLabel>
                    <FormControl>
                      <Input placeholder="山田 太郎" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="03-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>登録番号</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">保存</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

