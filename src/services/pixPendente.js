const chave = "pixPendente";

export function registrarPixPendente(pedidoId) {
  localStorage.setItem(chave, JSON.stringify({
    pedidoId,
    carrinho: localStorage.getItem("carrinho"),
    endereco: localStorage.getItem("enderecoCheckout"),
  }));
}

// O argumento deve vir da consulta autenticada ao backend.
export function concluirPixPendente(pedido) {
  let pendente;
  try {
    pendente = JSON.parse(localStorage.getItem(chave));
  } catch {
    return false;
  }
  if (!pendente || pedido.id !== pendente.pedidoId || pedido.status !== "Pago") {
    return false;
  }
  // Preserva compras adicionadas/alteradas enquanto o Pix aguardava confirmação.
  if (localStorage.getItem("carrinho") === pendente.carrinho) {
    localStorage.removeItem("carrinho");
  }
  if (localStorage.getItem("enderecoCheckout") === pendente.endereco) {
    localStorage.removeItem("enderecoCheckout");
    localStorage.removeItem("formaPagamento");
  }
  localStorage.removeItem(chave);
  return true;
}
