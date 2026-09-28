export const moedaCupom = valor => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function dataBrasiliaInput(valor) {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric",
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(valor));
  const valores = Object.fromEntries(partes.map(p => [p.type, p.value]));
  return `${valores.year}-${valores.month}-${valores.day}T${valores.hour}:${valores.minute}`;
}

export const dataBrasiliaUtc = valor => new Date(`${valor}:00-03:00`).toISOString();
export const itensCupom = carrinho => carrinho.map(item => ({ variacaoProdutoId: Number(item.variacaoId), quantidade: Number(item.quantidade) }));
export function cupomSalvo() {
  try { return localStorage.getItem("cupomCheckout") || ""; } catch { return ""; }
}
export function salvarCupom(codigo) {
  try { if (codigo) localStorage.setItem("cupomCheckout", codigo); else localStorage.removeItem("cupomCheckout"); } catch { /* A compra continua sem persistência local. */ }
}
