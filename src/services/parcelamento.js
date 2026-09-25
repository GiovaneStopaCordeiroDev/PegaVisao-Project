export function calcularParcelamento(preco) {
  const valor = Number(preco) || 0;
  if (valor <= 0) return null;
  const quantidade = Math.max(1, Math.min(12, Math.floor(valor / 5)));
  return { quantidade, valorParcela: Math.round((valor / quantidade) * 100) / 100 };
}
export function textoParcelamento(preco) {
  const p = calcularParcelamento(preco);
  if (!p || p.quantidade < 2) return null;
  return `até ${p.quantidade}x de ${p.valorParcela.toLocaleString("pt-BR", { style:"currency", currency:"BRL" })} sem juros`;
}