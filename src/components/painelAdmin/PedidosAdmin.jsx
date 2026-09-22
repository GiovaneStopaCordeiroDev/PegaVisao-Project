import { useEffect, useState } from "react";
import api from "../../services/api";
import "./pedidosAdmin.css";

const moeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const filtros = [["todos", "Todos"], ["pendentes", "Pendentes"], ["concluidos", "Concluídos"], ["cancelados", "Cancelados"]];

export function PedidosAdmin() {
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true);
    setErro("");
    setResultado(null);
    api.get("/api/admin/pedidos", { params: { filtro, pagina, tamanhoPagina: 20 },
      signal: controller.signal, timeout: 20000 })
      .then(({ data }) => { if (!controller.signal.aborted) setResultado(data); })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setErro(error.response?.status === 403 ? "Somente administradores podem consultar estes pedidos."
          : error.response?.status === 401 ? "Sua sessão expirou. Entre novamente."
          : "Não foi possível carregar os pedidos. Tente atualizar a lista.");
      })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [filtro, pagina, atualizacao]);

  return <section className="admin-pedidos" aria-labelledby="admin-pedidos-titulo">
    <div className="admin-pedidos-topo">
      <div><h1 id="admin-pedidos-titulo">Pedidos</h1><p>Acompanhe as compras de todos os clientes.</p></div>
      <button type="button" onClick={() => setAtualizacao((n) => n + 1)} disabled={carregando}>Atualizar pedidos</button>
    </div>
    <div className="admin-pedidos-filtros" aria-label="Filtrar pedidos">
      {filtros.map(([valor, nome]) => <button key={valor} type="button" aria-pressed={filtro === valor}
        onClick={() => { setFiltro(valor); setPagina(1); }}>{nome}</button>)}
    </div>
    {filtro === "concluidos" && <p className="admin-pedidos-nota">Compras com pagamento confirmado: pagas, enviadas ou entregues. O status indica a etapa da entrega.</p>}
    {carregando && <p role="status">Carregando pedidos...</p>}
    {erro && <p role="alert">{erro}</p>}
    {!carregando && resultado && <>
      <p className="admin-pedidos-nota">{resultado.total} pedido(s) encontrado(s)</p>
      {!resultado.pedidos.length && <div className="admin-pedidos-vazio">Nenhum pedido neste filtro.</div>}
      <div className="admin-pedidos-lista">
        {resultado.pedidos.map((pedido) => <article key={pedido.id} className="admin-pedido">
          <header>
            <div><h2>Pedido #{pedido.id}</h2><time dateTime={pedido.dataPedido}>{new Date(pedido.dataPedido).toLocaleString("pt-BR")}</time></div>
            <span className={`admin-pedido-status admin-pedido-status-${pedido.status.toLowerCase()}`}>{pedido.status}</span>
          </header>
          <div className="admin-pedido-resumo">
            <div><span>Cliente</span><strong>{pedido.cliente.nome}</strong><small>{pedido.cliente.email}</small></div>
            <div><span>Pagamento</span><strong>{pedido.formaPagamento}</strong></div>
            <div><span>Total com frete</span><strong>{moeda(pedido.valorTotal)}</strong></div>
          </div>
          <details>
            <summary>Ver itens e entrega</summary>
            <ul className="admin-pedido-itens">
              {pedido.itens.map((item) => <li key={item.id}>
                {item.imagem && <img src={item.imagem} alt="" loading="lazy" />}
                <div><strong>{item.nome}</strong><span>{item.cor} · {item.tamanho}</span>
                  <small>{item.quantidade} unidade(s) × {moeda(item.precoUnitario)}</small></div>
                <strong>{moeda(item.quantidade * item.precoUnitario)}</strong>
              </li>)}
            </ul>
            <dl className="admin-pedido-valores">
              <div><dt>Produtos</dt><dd>{moeda(pedido.subtotalProdutos)}</dd></div>
              <div><dt>Frete</dt><dd>{moeda(pedido.valorFrete)}</dd></div>
            </dl>
            <h3>Entrega</h3>
            {pedido.freteServicoId === 2147483647 ? <p>Pedido de teste sem entrega.</p> : <>
              {pedido.freteServico && <p>{pedido.freteTransportadora} · {pedido.freteServico}
                {pedido.fretePrazoDias != null && ` — ${pedido.fretePrazoDias} dias úteis após postagem`}</p>}
              <address>{pedido.endereco.rua}, {pedido.endereco.numero}{pedido.endereco.complemento && ` — ${pedido.endereco.complemento}`}<br />
                {pedido.endereco.bairro} · {pedido.endereco.cidade}/{pedido.endereco.estado}<br />CEP {pedido.endereco.cep}</address>
            </>}
          </details>
        </article>)}
      </div>
      {resultado.totalPaginas > 1 && <nav className="admin-pedidos-paginacao" aria-label="Páginas de pedidos">
        <button type="button" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>Anterior</button>
        <span>Página {pagina} de {resultado.totalPaginas}</span>
        <button type="button" disabled={pagina >= resultado.totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</button>
      </nav>}
    </>}
  </section>;
}
