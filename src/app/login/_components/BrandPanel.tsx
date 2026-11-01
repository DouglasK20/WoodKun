import Image from "next/image"
import { Calculator, FileText, Layers } from "lucide-react"

// Degradê em tons de madeira: dois "brilhos" (radial) sobre uma base escura (linear)
export const WOOD_GRADIENT = [
  "radial-gradient(ellipse at 15% 10%, oklch(0.66 0.13 68 / 0.55), transparent 55%)",
  "radial-gradient(ellipse at 90% 85%, oklch(0.5 0.12 40 / 0.6), transparent 60%)",
  "linear-gradient(140deg, oklch(0.36 0.06 58), oklch(0.2 0.03 50))",
].join(", ")

const FEATURES = [
  { icon: Layers, text: "Materiais e preços sempre atualizados" },
  { icon: Calculator, text: "Custo dos produtos calculado automaticamente" },
  { icon: FileText, text: "Orçamentos em PDF com a marca da sua marcenaria" },
]

// Linhas onduladas bem claras, imitando os veios da madeira
export function WoodGrain({ className }: { className?: string }) {
  const lines = Array.from({ length: 14 }, (_, index) => {
    const y = 40 + index * 60
    const wave = 18 + (index % 4) * 8
    return `M -50 ${y} C 150 ${y - wave}, 300 ${y + wave}, 450 ${y} S 750 ${y - wave}, 900 ${y}`
  })

  return (
    <svg className={className} viewBox="0 0 850 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {lines.map((d, index) => (
        <path key={index} d={d} fill="none" stroke="white" strokeOpacity={index % 3 === 0 ? 0.09 : 0.05} strokeWidth={index % 3 === 0 ? 2 : 1} />
      ))}
    </svg>
  )
}

// Metade esquerda da tela de login (só em telas largas)
export function BrandPanel() {
  return (
    <aside
      className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
      style={{ backgroundImage: WOOD_GRADIENT }}
    >
      <WoodGrain className="absolute inset-0 h-full w-full" />

      <div className="relative flex items-center gap-3">
        <div className="rounded-xl bg-white/90 p-1.5 shadow-lg">
          <Image src="/assets/Logotipo-WoodKun-pdf.png" alt="" width={44} height={34} priority />
        </div>
        <span className="text-xl font-semibold tracking-tight">WoodKun</span>
      </div>

      <div className="relative max-w-md space-y-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold leading-tight">Do material ao orçamento, sem planilha.</h2>
          <p className="text-lg text-white/75">
            Cadastre materiais e produtos uma vez e monte orçamentos para seus clientes em minutos.
          </p>
        </div>
        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-white/90">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-white/50">© {new Date().getFullYear()} WoodKun · Gestão para marcenarias</p>
    </aside>
  )
}
