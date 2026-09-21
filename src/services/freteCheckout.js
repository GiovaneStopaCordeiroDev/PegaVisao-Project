export function lerJsonSeguro(chave) {
  try { return JSON.parse(localStorage.getItem(chave)); } catch { return null; }
}

export function chaveCarrinho(itens) {
  const quantidades = new Map();
  for (const item of itens) {
    const id = Number(item.variacaoId);
    quantidades.set(id, (quantidades.get(id) || 0) + Number(item.quantidade));
  }
  return JSON.stringify([...quantidades].sort((a, b) => a[0] - b[0]));
}

export function freteValido(frete, cep, itens, agora = Date.now()) {
  return Boolean(frete?.id && frete?.servicoId &&
    frete.cepDestino === String(cep || "").replace(/\D/g, "") &&
    frete.carrinhoChave === chaveCarrinho(itens) &&
    new Date(frete.expiraEm).getTime() > agora &&
    Array.isArray(frete.opcoes) && frete.opcoes.some((opcao) => opcao.servicoId === frete.servicoId));
}
