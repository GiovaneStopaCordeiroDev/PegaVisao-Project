const chave = "pixPendente";
const chavePagamento = "pagamentoPendente";

function ler(chaveStorage) {
  try { return JSON.parse(localStorage.getItem(chaveStorage)); } catch { return null; }
}

export function urlCheckoutSegura(valor) {
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && !url.username && !url.password &&
      ["mercadopago.com", "mercadopago.com.br"].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch { return false; }
}

// O endpoint por ID retorna status compacto; a listagem autenticada contém QR/URL.
export async function consultarPagamento(api, pedidoId, signal) {
  const { data } = await api.get(`/Pedido/${pedidoId}`, { signal, timeout: 10000 });
  if (data.id !== pedidoId) throw new Error("Pedido divergente");
  if (data.status !== "Pendente") return data;
  const { data: pedidos } = await api.get("/Pedido", { signal, timeout: 10000 });
  const pedido = pedidos.find(item => item.id === pedidoId);
  if (!pedido) throw new Error("Pedido não encontrado na conta");
  return { ...pedido, servidorAgora: data.servidorAgora };
}

function snapshotCheckout() {
  return {
    carrinho: localStorage.getItem("carrinho"),
    endereco: localStorage.getItem("enderecoCheckout"),
    frete: localStorage.getItem("freteCheckout"),
    destinatario: localStorage.getItem("destinatarioCheckout"),
    destinatarioSessao: typeof sessionStorage !== "undefined" ? sessionStorage.getItem("destinatarioCheckout") : null,
    forma: localStorage.getItem("formaPagamento"),
    usuarioId: ler("usuario")?.id,
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
  const pendente = ler(chavePagamento) || ler(chave);
  if (!Number.isSafeInteger(pendente?.pedidoId) || pendente.pedidoId <= 0) return null;
  if (pendente.usuarioId && pendente.usuarioId !== ler("usuario")?.id) return null;
  return pendente;
}

export function limparPagamentoPendente(pedidoId) {
  for (const item of [chavePagamento, chave]) {
    if (ler(item)?.pedidoId === pedidoId) localStorage.removeItem(item);
  }
}

function limparSnapshotSeInalterado(pendente) {
  // Um novo carrinho mantém também seu endereço, frete e destinatário.
  if (localStorage.getItem("carrinho") !== pendente.carrinho) return;
  if (localStorage.getItem("carrinho") === pendente.carrinho) {
    localStorage.removeItem("carrinho");
  }
  if (localStorage.getItem("enderecoCheckout") === pendente.endereco) {
    localStorage.removeItem("enderecoCheckout");
  }
  if (localStorage.getItem("freteCheckout") === pendente.frete) {
    localStorage.removeItem("freteCheckout");
  }
  if (localStorage.getItem("destinatarioCheckout") === pendente.destinatario) {
    localStorage.removeItem("destinatarioCheckout");
  }
  if (localStorage.getItem("formaPagamento") === pendente.forma) localStorage.removeItem("formaPagamento");
  if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("destinatarioCheckout") === pendente.destinatarioSessao) {
    sessionStorage.removeItem("destinatarioCheckout");
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
  limparPagamentoPendente(pedido.id);
  return true;
}

export function concluirPagamentoPendente(pedido) {
  const pendente = obterPagamentoPendente();
  if (!pendente || pedido?.id !== pendente.pedidoId || pedido?.status !== "Pago") {
    return false;
  }

  limparSnapshotSeInalterado(pendente);
  limparPagamentoPendente(pedido.id);
  return true;
}
