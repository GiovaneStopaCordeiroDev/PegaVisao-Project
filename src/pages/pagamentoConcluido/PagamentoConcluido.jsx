import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { concluirPagamentoPendente, concluirPixPendente } from "../../services/pixPendente";
import "./PagamentoConcluido.css";

export function PagamentoConcluido() {
  const [params] = useSearchParams();
  const pedidoId = params.get("pedido");
  const [confirmado, setConfirmado] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    if (/^[1-9]\d*$/.test(pedidoId || "")) {
      api.get(`/Pedido/${pedidoId}`, { signal: controller.signal, timeout: 10000 })
        .then(({ data }) => {
          if (controller.signal.aborted) return;
          const pago = data.id === Number(pedidoId) && data.status === "Pago";
          setConfirmado({ id: pedidoId, pago });
          if (pago) { concluirPixPendente(data); concluirPagamentoPendente(data); }
        }).catch(() => { if (!controller.signal.aborted) setConfirmado({ id: pedidoId, pago: false }); });
    }
    return () => controller.abort();
  }, [pedidoId]);
  if (confirmado?.id !== pedidoId || !confirmado.pago) return (
    <main className="pagamento-concluido"><section className="pagamento-concluido-card">
      <h1>{/^[1-9]\d*$/.test(pedidoId || "") && confirmado?.id !== pedidoId ? "Consultando pagamento…" : "Pagamento não confirmado"}</h1>
      <p>Confira a situação atual do pedido na sua conta.</p>
      <Link to="/pedidos" className="pagamento-concluido-botao">Ir para Meus Pedidos</Link>
    </section></main>
  );

  return (
    <main className="pagamento-concluido">
      <section className="pagamento-concluido-card">
        <div className="pagamento-concluido-icone" aria-hidden="true">✓</div>
        <h1>Pagamento confirmado!</h1>
        <p>
          Seu pagamento foi concluído com sucesso e o pedido já está disponível
          na área de Meus Pedidos.
        </p>
        {pedidoId && <strong>Pedido #{pedidoId}</strong>}
        <Link to="/pedidos" className="pagamento-concluido-botao">
          Ir para Meus Pedidos
        </Link>
      </section>
    </main>
  );
}
