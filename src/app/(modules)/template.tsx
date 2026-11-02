// template (e não layout): o Next remonta este componente a cada troca de página,
// então a animação de entrada roda em toda navegação. O layout (sidebar, cabeçalho) não remonta
export default function ModulesTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">{children}</div>
}
