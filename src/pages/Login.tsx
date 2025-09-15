import { useForm } from 'react-hook-form'
import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '@components/Button'
import FormField from '@components/FormField'

type Inputs = { email: string; password: string }

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Inputs>({
    defaultValues: { email: 'admin@example.com', password: 'password123' }
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (values: Inputs) => {
    const ok = await login(values.email, values.password)
    if (ok) navigate('/')
    else alert('認証に失敗しました')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-lg font-semibold mb-4">ログイン</h1>
        <p className="text-xs text-gray-600 mb-3">このアプリはニーズ検証のためのモック版です。個人情報は入力しないでください。</p>
        <FormField label="メールアドレス" error={errors.email?.message}>
          <input className="w-full border rounded px-3 py-2" {...register('email', { required: '必須です' })} />
        </FormField>
        <FormField label="パスワード" error={errors.password?.message}>
          <input type="password" className="w-full border rounded px-3 py-2" {...register('password', { required: '必須です' })} />
        </FormField>
        <Button type="submit" disabled={isSubmitting} className="w-full">ログイン</Button>
      </form>
    </div>
  )
}
