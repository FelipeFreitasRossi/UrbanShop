const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata valores em reais: 189.9 → "R$ 189,90". */
export function formatPrice(value: number) {
  return brl.format(value);
}

/** Percentual de desconto arredondado: (199, 149) → 25. */
export function discountPercent(price: number, promotional?: number | null) {
  if (!promotional || promotional >= price) return 0;
  return Math.round((1 - promotional / price) * 100);
}
