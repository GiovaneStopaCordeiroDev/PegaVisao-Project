const CHAVE = "pagamentoPendente";

export function salvarPagamentoPendente(pedido) {
  if (!pedido?.id) return;
  localStorage.setItem(CHAVE, JSON.stringify({
    pedidoId: pedido.id,
    checkoutUrl: pedido.mercadoPagoCheckoutUrl || null,
    formaPagamento: pedido.formaPagamento || null,
    criadoEm: new Date().toISOString(),
  }));
}

export function lerPagamentoPendente() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || null; }
  catch { return null; }
}

export function limparPagamentoPendente() {
  localStorage.removeItem(CHAVE);
}

export function limparCheckoutConcluido() {
  localStorage.removeItem("carrinho");
  localStorage.removeItem("enderecoCheckout");
  localStorage.removeItem("formaPagamento");
  localStorage.removeItem("freteCheckout");
  localStorage.removeItem("destinatarioCheckout");
  sessionStorage.removeItem("destinatarioCheckout");
  limparPagamentoPendente();
}