// Cálculos de preço usados no servidor (API) e no formulário (prévia ao vivo), para os dois darem sempre o mesmo valor

// Arredonda para centavos. O toPrecision tira o "ruído" do ponto flutuante antes de arredondar:
// 280.95 * 1.5 dá 421.42499999999995 no JavaScript, que sem isso arredondaria para 421.42 em vez de 421.43
export function roundMoney(value: number) {
  return Math.round(Number((value * 100).toPrecision(15))) / 100
}

// Soma de quantidade × preço (custo dos materiais de um produto, subtotal de um orçamento…)
export function calculateItemsTotal(items: { quantity: number; unitPrice: number }[]) {
  return roundMoney(items.reduce((total, item) => total + item.quantity * item.unitPrice, 0))
}

// Preço final = custo + margem de lucro (%) sobre o custo
export function calculatePrice(cost: number, profitMargin: number) {
  return roundMoney(cost * (1 + profitMargin / 100))
}

// Total do orçamento = subtotal − desconto (nunca negativo)
export function calculateQuoteTotal(subtotal: number, discount: number) {
  return roundMoney(Math.max(subtotal - discount, 0))
}
