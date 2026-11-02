"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Mail, Phone } from "lucide-react"
import { toast } from "sonner"

import { Field } from "@/components/form/Field"
import { PasswordInput } from "@/components/form/PasswordInput"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { useLogin } from "@/hooks/queries/useAuth"
import { loginSchema, type LoginInput } from "@/schemas/auth"

// Contato da marcenaria (das configurações da empresa), mostrado em "Esqueceu a senha?"
export type SupportContact = {
  companyName: string | null
  phone: string | null
  email: string | null
}

type LoginFormProps = {
  redirectTo: string
  support: SupportContact
}

export function LoginForm({ redirectTo, support }: LoginFormProps) {
  const router = useRouter()
  const login = useLogin()
  const [showForgotPassword, setShowForgotPassword] = useState(false)

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
      onSuccess: (data) => {
        toast.success(`Bem-vindo, ${data.user.name.split(" ")[0]}!`)
        // replace: o login não fica no histórico (o "voltar" do navegador não volta para cá)
        router.replace(redirectTo)
        // refresh: o layout (server component) roda de novo, agora enxergando o cookie da sessão
        router.refresh()
      },
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" autoFocus placeholder="voce@suamarcenaria.com" {...register("email")} />
      </Field>

      <div className="space-y-2">
        <Field label="Senha" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgotPassword((current) => !current)}
            aria-expanded={showForgotPassword}
            className="cursor-pointer text-sm text-primary hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>

      {showForgotPassword && <ForgotPasswordHelp support={support} />}

      {login.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {login.error.message}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full cursor-pointer" disabled={login.isPending || login.isSuccess}>
        {login.isPending || login.isSuccess ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  )
}

// Sem envio de e-mail configurado, quem redefine a senha é o administrador (tela Usuários)
function ForgotPasswordHelp({ support }: { support: SupportContact }) {
  const hasContact = support.phone || support.email

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/60 p-4 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <KeyRound className="size-4 text-primary" />
        Recuperar acesso
      </p>
      <p className="text-muted-foreground">
        Peça ao administrador do sistema para redefinir a sua senha. Ele faz isso em <strong>Usuários</strong>, e você
        entra com a senha nova na hora.
      </p>
      {hasContact && (
        <div className="space-y-1.5 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Fale com {support.companyName ?? "a empresa"}:</p>
          {support.phone && (
            <a href={`tel:${support.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-foreground hover:text-primary">
              <Phone className="size-4" />
              {support.phone}
            </a>
          )}
          {support.email && (
            <a href={`mailto:${support.email}?subject=${encodeURIComponent("Recuperar acesso ao WoodKun")}`} className="flex items-center gap-2 text-foreground hover:text-primary">
              <Mail className="size-4" />
              {support.email}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
