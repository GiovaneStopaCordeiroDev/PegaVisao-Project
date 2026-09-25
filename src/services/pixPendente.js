const chave = "pixPendente";
const chavePagamento = "pagamentoPendente";

function snapshotCheckout() {
  return {
    carrinho: localStorage.getItem("carrinho"),
    endereco: localStorage.getItem("enderecoCheckout"),
    frete: localStorage.getItem("freteCheckout"),
    destinatario: localStorage.getItem("destinatarioCheckout"),
  };
}

export function registrarPixPendente(pedidoId) {
  localStorage.setItem(chave, JSON.stringify({
    pedidoId,
    ...snapshotCheckout(),
  }));
}

export function registrarPagamentoPendente(pedido) {
  if (!pedido?.id) return;

  localStorage.setItem(chavePagamento, JSON.stringify({
    pedidoId: pedido.id,
    checkoutUrl: pedido.mercadoPagoCheckoutUrl || null,
    formaPagamento: pedido.formaPagamento || null,
    ...snapshotCheckout(),
  }));
}

export function obterPagamentoPendente() {
  try {
    return JSON.parse(localStorage.getItem(chavePagamento));
  } catch {
    return null;
  }
}

export function limparPagamentoPendente() {
  localStorage.removeItem(chavePagamento);
}

function limparSnapshotSeInalterado(pendente) {
  if (localStorage.getItem("carrinho") === pendente.carrinho) {
    localStorage.removeItem("carrinho");
  }
  if (localStorage.getItem("enderecoCheckout") === pendente.endereco) {
    localStorage.removeItem("enderecoCheckout");
    localStorage.removeItem("formaPagamento");
  }
  if (localStorage.getItem("freteCheckout") === pendente.frete) {
    localStorage.removeItem("freteCheckout");
  }
  if (localStorage.getItem("destinatarioCheckout") === pendente.destinatario) {
    localStorage.removeItem("destinatarioCheckout");
  }
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

  limparSnapshotSeInalterado(pendente);
  localStorage.removeItem(chave);
  limparPagamentoPendente();
  return true;
}

export function concluirPagamentoPendente(pedido) {
  const pendente = obterPagamentoPendente();
  if (!pendente || pedido?.id !== pendente.pedidoId || pedido?.status !== "Pago") {
    return false;
  }

  limparSnapshotSeInalterado(pendente);
  limparPagamentoPendente();
  return true;
}
