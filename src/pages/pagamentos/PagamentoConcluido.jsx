import { Link, useSearchParams } from "react-router-dom";
import "./pagamentos.css";

export function PagamentoConcluido() {
  const [params] = useSearchParams();
  const pedidoId = params.get("pedido");
  return <main className="pagina-pagamento"><div className="cabecalho-pagamento"><h1>Pagamento concluído</h1><p>Seu pagamento foi confirmado com sucesso.</p></div><div className="conteudo-pagamento"><section className="area-pagamento"><div className="bloco-pagamento pagamento-sucesso"><h2>Pedido confirmado</h2><p>{pedidoId ? `O pedido #${pedidoId} já está disponível` : "Seu pedido já está disponível"} na página de Meus pedidos.</p><p>Por lá você poderá acompanhar o andamento e, quando disponível, o código de rastreio.</p><Link className="botao-pagar" to="/pedidos">Ir para Meus pedidos</Link></div></section></div></main>;
}