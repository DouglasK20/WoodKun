"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Field } from "@/components/form/Field"
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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewUserInput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", email: "", role: "sales", password: "" },
  })

  function onSubmit(values: NewUserInput) {
    createUser.mutate(values, { onSuccess: () => router.push("/usuarios") })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
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

      <div className="flex gap-2">
        <Button type="submit" disabled={createUser.isPending} className="cursor-pointer">
          {createUser.isPending ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/usuarios">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

function EditUserForm({ user, adminCount }: { user: UserListItem; adminCount: number }) {
  const router = useRouter()
  const updateUser = useUpdateUser()
  const isSelf = useCurrentUser().id === user.id

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { role: (user.role as Role) ?? "sales", password: "" },
  })

  function onSubmit(values: EditUserInput) {
    // Nunca deixar o sistema sem nenhum administrador ativo
    if (user.role === "admin" && values.role !== "admin" && adminCount <= 1) {
      setError("role", { message: "Este é o único administrador. Crie outro administrador antes de mudar o papel." })
      return
    }
    updateUser.mutate({ userId: user.id, ...values }, { onSuccess: () => router.push("/usuarios") })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
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

      <div className="flex gap-2">
        <Button type="submit" disabled={updateUser.isPending} className="cursor-pointer">
          {updateUser.isPending ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/usuarios">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
