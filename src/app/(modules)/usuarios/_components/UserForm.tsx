"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Field } from "@/components/form/Field"
import { FormActions, type SaveIntent } from "@/components/form/FormActions"
import { FormSection } from "@/components/form/FormSection"
import { Select } from "@/components/form/Select"
import { PasswordInput } from "@/components/form/PasswordInput"
import { useCurrentUser } from "@/components/providers/UserProvider"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Skeleton } from "@/components/shadcn/skeleton"
import { useCreateUser, useUpdateUser, useUsers, type UserListItem } from "@/hooks/queries/useUsers"
import { editUserSchema, newUserSchema, type EditUserInput, type NewUserInput } from "@/schemas/user"
import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type Role } from "@/utils/permissions"

export function UserForm({ userId }: { userId?: string }) {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <Skeleton className="h-72 w-full max-w-2xl" />
  if (error) return <p className="text-sm text-destructive">{error.message}</p>

  if (!userId) return <NewUserForm />

  const user = users?.find((item) => item.id === userId)
  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Usuário não encontrado</p>
        <Button variant="outline" asChild>
          <Link href="/usuarios">Voltar para usuários</Link>
        </Button>
      </div>
    )
  }

  const adminCount = users?.filter((item) => item.role === "admin" && !item.banned).length ?? 0
  return <EditUserForm user={user} adminCount={adminCount} />
}

// Opções de papel com a descrição do que cada um pode fazer
const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role], description: ROLE_DESCRIPTION[role] }))

function NewUserForm() {
  const router = useRouter()
  const createUser = useCreateUser()
  const [intent, setIntent] = useState<SaveIntent>("stay")
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewUserInput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", email: "", role: "sales", password: "" },
  })

  // "stay": continua na página (vira a edição do usuário criado); "back": volta para a listagem
  function onSubmit(values: NewUserInput, saveIntent: SaveIntent) {
    setIntent(saveIntent)
    createUser.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Usuário ${values.name} criado`)
        if (saveIntent === "back") router.push("/usuarios")
        // A página vira a edição do usuário criado (salvar de novo atualiza, não cria outro)
        else router.replace(`/usuarios/cadastro?id=${created.user.id}`)
      },
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit((values) => onSubmit(values, "stay"))} className="max-w-2xl space-y-6">
      <FormSection title="Dados do usuário">
        <Field label="Nome" htmlFor="name" error={errors.name?.message} className="sm:col-span-3">
          <Input id="name" {...register("name")} />
        </Field>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message} className="sm:col-span-3">
          <Input id="email" type="email" autoComplete="off" {...register("email")} />
        </Field>
        <Field label="Papel" htmlFor="role" error={errors.role?.message} className="sm:col-span-6">
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select id="role" options={ROLE_OPTIONS} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
            )}
          />
        </Field>
        <Field label="Senha inicial" htmlFor="password" error={errors.password?.message} className="sm:col-span-3">
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <p className="self-end pb-2 text-xs text-muted-foreground sm:col-span-3">
          Mínimo de 8 caracteres. Passe a senha para a pessoa por um canal seguro.
        </p>
      </FormSection>

      {createUser.error && <p className="text-sm text-destructive">{createUser.error.message}</p>}

      <FormActions
        pending={createUser.isPending}
        intent={intent}
        onSaveAndBack={handleSubmit((values) => onSubmit(values, "back"))}
        cancelHref="/usuarios"
      />
    </form>
  )
}

function EditUserForm({ user, adminCount }: { user: UserListItem; adminCount: number }) {
  const router = useRouter()
  const updateUser = useUpdateUser()
  const [intent, setIntent] = useState<SaveIntent>("stay")
  const isSelf = useCurrentUser().id === user.id

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { role: (user.role as Role) ?? "sales", password: "" },
  })

  // "stay": continua na página; "back": volta para a listagem
  function onSubmit(values: EditUserInput, saveIntent: SaveIntent) {
    setIntent(saveIntent)
    // Nunca deixar o sistema sem nenhum administrador ativo
    if (user.role === "admin" && values.role !== "admin" && adminCount <= 1) {
      setError("role", { message: "Este é o único administrador. Crie outro administrador antes de mudar o papel." })
      return
    }
    updateUser.mutate(
      { userId: user.id, ...values },
      {
        onSuccess: () => {
          toast.success(values.password ? "Papel e senha atualizados" : "Usuário atualizado")
          if (saveIntent === "back") router.push("/usuarios")
          // Continua na página: limpa a senha digitada e considera o resto como "sem alterações"
          else reset({ role: values.role, password: "" })
        },
      }
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit((values) => onSubmit(values, "stay"))} className="max-w-2xl space-y-6">
      <FormSection title={user.name} description={user.email}>
        <Field label="Papel" htmlFor="role" error={errors.role?.message} className="sm:col-span-6">
          {/* Mudar o próprio papel poderia tirar o seu acesso a esta tela. Não usamos disabled: o react-hook-form
              não envia campos desabilitados, e o papel chegaria vazio. Sem o select, vale o defaultValues */}
          {isSelf ? (
            <p className="text-sm">
              {ROLE_LABEL[user.role as Role]}{" "}
              <span className="text-xs text-muted-foreground">(você não pode alterar o seu próprio papel)</span>
            </p>
          ) : (
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select id="role" options={ROLE_OPTIONS} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
              )}
            />
          )}
        </Field>
        <Field label="Nova senha" htmlFor="password" error={errors.password?.message} className="sm:col-span-3">
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <p className="self-end pb-2 text-xs text-muted-foreground sm:col-span-3">
          Deixe em branco para manter a senha atual.
        </p>
      </FormSection>

      {updateUser.error && <p className="text-sm text-destructive">{updateUser.error.message}</p>}

      <FormActions
        pending={updateUser.isPending}
        intent={intent}
        onSaveAndBack={handleSubmit((values) => onSubmit(values, "back"))}
        cancelHref="/usuarios"
      />
    </form>
  )
}
