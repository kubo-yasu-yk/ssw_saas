import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { useAuth } from '@context/AuthContext'
import { toast } from '@components/ui/use-toast'

const schema = z.object({
  email: z.string().email('メールアドレスの形式で入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
})

export default function LoginPage() {
  const { login, authError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'password123',
    },
  })

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true)
    const ok = await login(values.email, values.password)
    setIsLoading(false)
    if (ok) {
      toast({ title: 'ログインしました', description: 'ダッシュボードへリダイレクトします。' })
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-white px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">特定技能在留資格管理モック</CardTitle>
          <CardDescription>ニーズ検証向けのモック版です。デモ用の認証情報をご利用ください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '認証中...' : 'ログイン'}
              </Button>
              {authError && (
                <p className="text-sm text-destructive whitespace-pre-line" role="alert">
                  {authError.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                demo: admin@example.com / password123
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
