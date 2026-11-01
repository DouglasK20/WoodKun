"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Field } from "@/components/form/Field"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { useLogin } from "@/hooks/queries/useAuth"
import { loginSchema, type LoginInput } from "@/schemas/auth"

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginInput) {
    login.mutate(values, {
      onSuccess: () => {
        // replace: o login não fica no histórico (o "voltar" do navegador não volta para cá)
        router.replace(redirectTo)
        // refresh: o layout (server component) roda de novo, agora enxergando o cookie da sessão
        router.refresh()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" autoFocus {...register("email")} />
      </Field>

      <Field label="Senha" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
      </Field>

      {login.error && <p className="text-sm text-destructive">{login.error.message}</p>}

      <Button type="submit" className="w-full cursor-pointer" disabled={login.isPending || login.isSuccess}>
        {login.isPending || login.isSuccess ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  )
}
