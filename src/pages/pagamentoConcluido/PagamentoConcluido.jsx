import { Link, useSearchParams } from "react-router-dom";
import "./PagamentoConcluido.css";

export function PagamentoConcluido() {
  const [params] = useSearchParams();
  const pedidoId = params.get("pedido");

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
