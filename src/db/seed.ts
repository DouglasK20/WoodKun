// Popula o banco com dados de exemplo. Rodar com: npm run db:seed
import { db } from "./index"
import { customers, materials, type NewMaterial } from "./schema"

const sampleMaterials: NewMaterial[] = [
  { name: "Chapa MDF Branco TX 15mm", description: "Chapa 2,75 x 1,85 m, dupla face", measurementUnit: "M2", unitPrice: 72.9 },
  { name: "Chapa MDF Branco TX 6mm", description: "Ideal para fundos de armário e gavetas", measurementUnit: "M2", unitPrice: 38.5 },
  { name: "Chapa MDF Carvalho Hanover 18mm", description: "Padrão madeirado, dupla face", measurementUnit: "M2", unitPrice: 98.4 },
  { name: "Chapa MDF Cru 15mm", description: "Para pintura ou estrutura interna", measurementUnit: "M2", unitPrice: 52 },
  { name: "Compensado Naval 18mm", description: "Resistente à umidade", measurementUnit: "M2", unitPrice: 115 },
  { name: "Fita de borda PVC Branca 22mm", description: null, measurementUnit: "M", unitPrice: 1.2 },
  { name: "Fita de borda PVC Carvalho Hanover 22mm", description: null, measurementUnit: "M", unitPrice: 1.8 },
  { name: "Corrediça telescópica 45cm", description: "Par, extração total", measurementUnit: "UN", unitPrice: 32.9 },
  { name: "Dobradiça com amortecedor 35mm", description: "Curva, com calço", measurementUnit: "UN", unitPrice: 14.5 },
  { name: "Puxador perfil alumínio preto", description: "Perfil tipo cava", measurementUnit: "M", unitPrice: 42 },
  { name: "Puxador concha inox 96mm", description: null, measurementUnit: "UN", unitPrice: 9.9 },
  { name: "Pé regulável plástico 10cm", description: null, measurementUnit: "UN", unitPrice: 3.5 },
  { name: "Parafuso 4,0 x 40mm", description: "Cabeça chata, caixa com 100", measurementUnit: "UN", unitPrice: 18 },
  { name: "Cola PVA para madeira 1kg", description: null, measurementUnit: "UN", unitPrice: 27.9 },
  { name: "Cantoneira metálica 30mm", description: null, measurementUnit: "UN", unitPrice: 1.5 },
]

const sampleCustomers = [
  {
    name: "Mariana Souza", phone: "(63) 99212-4410", email: "mariana.souza@email.com",
    zipCode: "77803-020", street: "Rua 7", number: "120", neighborhood: "Centro", city: "Araguaína", state: "TO",
  },
  {
    name: "Carlos Pereira", phone: "(63) 98455-7023", email: "carlos.p@email.com",
    zipCode: "77804-010", street: "Avenida Cônego João Lima", number: "845", complement: "Apto 302", neighborhood: "Centro", city: "Araguaína", state: "TO",
  },
  {
    name: "Padaria Pão Dourado", phone: "(63) 3414-2290", document: "12.345.678/0001-95",
    zipCode: "77818-530", street: "Rua das Mangueiras", number: "33", neighborhood: "Setor Couto Magalhães", city: "Araguaína", state: "TO",
  },
]

async function main() {
  // Só insere se a tabela estiver vazia, para não duplicar ao rodar de novo
  if ((await db.$count(materials)) === 0) {
    await db.insert(materials).values(sampleMaterials)
    console.log(`${sampleMaterials.length} materiais inseridos`)
  } else {
    console.log("materials já possui registros, pulando")
  }

  if ((await db.$count(customers)) === 0) {
    await db.insert(customers).values(sampleCustomers)
    console.log(`${sampleCustomers.length} clientes inseridos`)
  } else {
    console.log("customers já possui registros, pulando")
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
