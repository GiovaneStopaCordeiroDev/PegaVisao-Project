export function calcularParcelamento(preco) {
  const valor = Number(preco) || 0;
  if (valor <= 0) return null;
  // Exibição conservadora: até 12x, mantendo parcela mínima de R$ 10.
  // O checkout do Mercado Pago continua sendo a fonte final das condições disponíveis.
  const quantidade = Math.max(1, Math.min(12, Math.floor(valor / 10)));
  return { quantidade, valorParcela: valor / quantidade };
}

export function textoParcelamento(preco) {
  const p = calcularParcelamento(preco);
  if (!p || p.quantidade < 2) return null;
  return `até ${p.quantidade}x de ${p.valorParcela.toLocaleString("pt-BR", { style:"currency", currency:"BRL" })}`;
}