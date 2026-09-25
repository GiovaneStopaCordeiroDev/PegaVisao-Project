import { useEffect, useState } from "react";
import api from "../../services/api";
import "./pedidosAdmin.css";

const moeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const filtros = [["todos", "Todos"], ["pendentes", "Pendentes"], ["concluidos", "Concluídos"], ["cancelados", "Cancelados"]];
const statusRastreio = {
  pending: "Pendente",
  released: "Etiqueta paga",
  generated: "Etiqueta gerada",
  received: "Recebido no ponto de distribuição",
  posted: "Postado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  undelivered: "Não entregue",
  paused: "Entrega interrompida",
  suspended: "Envio suspenso",
};

export function PedidosAdmin() {
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const [dadosEtiqueta, setDadosEtiqueta] = useState({});
  const [acaoEtiqueta, setAcaoEtiqueta] = useState({});
  const [mensagemEtiqueta, setMensagemEtiqueta] = useState({});

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

  function alterarDadoEtiqueta(pedidoId, campo, valor) {
    setDadosEtiqueta((atual) => ({
      ...atual,
      [pedidoId]: { ...(atual[pedidoId] || {}), [campo]: valor },
    }));
  }

  async function gerarEtiqueta(pedido) {
    setAcaoEtiqueta((atual) => ({ ...atual, [pedido.id]: "gerando" }));
    setMensagemEtiqueta((atual) => ({ ...atual, [pedido.id]: "" }));
    const dados = dadosEtiqueta[pedido.id] || {};

    try {
      const { data } = await api.post(
        `/api/admin/pedidos/${pedido.id}/etiqueta`,
        pedido.melhorEnvioOrderId
          ? { documento: "", telefone: "", chaveNfe: null }
          : {
              documento: dados.documento || null,
              telefone: dados.telefone || null,
              chaveNfe: dados.chaveNfe?.trim() || null,
            },
        { timeout: 35000 },
      );

      setMensagemEtiqueta((atual) => ({
        ...atual,
        [pedido.id]: data.statusEtiqueta === "gerada"
          ? "Etiqueta gerada. Agora você já pode imprimir."
          : "Envio atualizado no Melhor Envio.",
      }));
      setAtualizacao((n) => n + 1);
    } catch (error) {
      setMensagemEtiqueta((atual) => ({
        ...atual,
        [pedido.id]: error.response?.data?.mensagem || "Não foi possível gerar a etiqueta.",
      }));
    } finally {
      setAcaoEtiqueta((atual) => ({ ...atual, [pedido.id]: "" }));
    }
  }

  async function atualizarRastreio(pedido) {
    setAcaoEtiqueta((atual) => ({ ...atual, [pedido.id]: "rastreio" }));
    setMensagemEtiqueta((atual) => ({ ...atual, [pedido.id]: "" }));

    try {
      const { data } = await api.post(
        `/api/admin/pedidos/${pedido.id}/rastreio/atualizar`,
        {},
        { timeout: 30000 },
      );

      setMensagemEtiqueta((atual) => ({
        ...atual,
        [pedido.id]: data.melhorEnvioTracking
          ? `Rastreio atualizado: ${data.melhorEnvioTracking}`
          : "Rastreio atualizado. A transportadora ainda não liberou o código.",
      }));
      setAtualizacao((n) => n + 1);
    } catch (error) {
      setMensagemEtiqueta((atual) => ({
        ...atual,
        [pedido.id]: error.response?.data?.mensagem || "Não foi possível atualizar o rastreio.",
      }));
    } finally {
      setAcaoEtiqueta((atual) => ({ ...atual, [pedido.id]: "" }));
    }
  }

  async function imprimirEtiqueta(pedido) {
    const janela = window.open("about:blank", "_blank");
    setAcaoEtiqueta((atual) => ({ ...atual, [pedido.id]: "imprimindo" }));
    setMensagemEtiqueta((atual) => ({ ...atual, [pedido.id]: "" }));

    try {
      const { data } = await api.get(
        `/api/admin/pedidos/${pedido.id}/etiqueta/impressao`,
        { timeout: 30000 },
      );

      if (!data?.url) throw new Error("Link de impressão ausente.");
      if (janela) {
        janela.opener = null;
        janela.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch (error) {
      if (janela) janela.close();
      setMensagemEtiqueta((atual) => ({
        ...atual,
        [pedido.id]: error.response?.data?.mensagem || "Não foi possível abrir a etiqueta para impressão.",
      }));
    } finally {
      setAcaoEtiqueta((atual) => ({ ...atual, [pedido.id]: "" }));
    }
  }

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

              {(pedido.status === "Pago" || pedido.status === "Enviado" || pedido.melhorEnvioOrderId) && (
                <div className="admin-etiqueta">
                  <div className="admin-etiqueta-cabecalho">
                    <div>
                      <h4>Etiqueta de envio</h4>
                      <p>
                        {pedido.melhorEnvioOrderId
                          ? `Envio Melhor Envio: ${pedido.melhorEnvioOrderId}`
                          : pedido.temCpfDestinatario && pedido.temTelefoneDestinatario
                            ? "CPF e telefone já foram salvos no checkout. Informe apenas a NF-e e gere a etiqueta."
                            : "Pedido antigo: preencha somente os dados do destinatário que estão faltando."}
                      </p>
                    </div>
                    {pedido.melhorEnvioEtiquetaStatus && (
                      <span className="admin-etiqueta-status">{pedido.melhorEnvioEtiquetaStatus}</span>
                    )}
                  </div>

                  {!pedido.melhorEnvioOrderId && (
                    <div className="admin-etiqueta-campos">
                      {!pedido.temCpfDestinatario && (
                        <label>
                          CPF do destinatário
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Somente números"
                            value={dadosEtiqueta[pedido.id]?.documento || ""}
                            onChange={(event) => alterarDadoEtiqueta(pedido.id, "documento", event.target.value)}
                          />
                        </label>
                      )}
                      {!pedido.temTelefoneDestinatario && (
                        <label>
                          Telefone do destinatário
                          <input
                            type="tel"
                            placeholder="DDD + número"
                            value={dadosEtiqueta[pedido.id]?.telefone || ""}
                            onChange={(event) => alterarDadoEtiqueta(pedido.id, "telefone", event.target.value)}
                          />
                        </label>
                      )}
                      <label className="admin-etiqueta-nfe">
                        Chave da NF-e
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={44}
                          placeholder="44 dígitos; deixe vazio somente se puder usar declaração de conteúdo"
                          value={dadosEtiqueta[pedido.id]?.chaveNfe || ""}
                          onChange={(event) => alterarDadoEtiqueta(pedido.id, "chaveNfe", event.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  {pedido.melhorEnvioOrderId && (
                    <div className="admin-rastreio">
                      <strong>Rastreamento</strong>
                      {pedido.melhorEnvioTracking ? (
                        <>
                          <span className="admin-rastreio-codigo">{pedido.melhorEnvioTracking}</span>
                          {pedido.melhorEnvioRastreioStatus && (
                            <small>Status: {statusRastreio[pedido.melhorEnvioRastreioStatus] || pedido.melhorEnvioRastreioStatus}</small>
                          )}
                          {pedido.melhorEnvioTrackingUrl && (
                            <a href={pedido.melhorEnvioTrackingUrl} target="_blank" rel="noreferrer">
                              Acompanhar entrega
                            </a>
                          )}
                        </>
                      ) : (
                        <span>A transportadora ainda não liberou o código de rastreio.</span>
                      )}
                      <button
                        type="button"
                        onClick={() => atualizarRastreio(pedido)}
                        disabled={Boolean(acaoEtiqueta[pedido.id])}
                      >
                        {acaoEtiqueta[pedido.id] === "rastreio" ? "Atualizando..." : "Atualizar rastreio"}
                      </button>
                    </div>
                  )}

                  <div className="admin-etiqueta-acoes">
                    {pedido.melhorEnvioEtiquetaStatus !== "gerada" && (
                      <button
                        type="button"
                        onClick={() => gerarEtiqueta(pedido)}
                        disabled={Boolean(acaoEtiqueta[pedido.id])}
                      >
                        {acaoEtiqueta[pedido.id] === "gerando"
                          ? "Gerando..."
                          : pedido.melhorEnvioOrderId
                            ? "Continuar geração"
                            : "Gerar etiqueta"}
                      </button>
                    )}

                    {pedido.melhorEnvioEtiquetaStatus === "gerada" && (
                      <button
                        type="button"
                        className="admin-etiqueta-imprimir"
                        onClick={() => imprimirEtiqueta(pedido)}
                        disabled={Boolean(acaoEtiqueta[pedido.id])}
                      >
                        {acaoEtiqueta[pedido.id] === "imprimindo" ? "Abrindo..." : "Imprimir etiqueta"}
                      </button>
                    )}
                  </div>

                  {mensagemEtiqueta[pedido.id] && (
                    <p className="admin-etiqueta-mensagem" role="status">{mensagemEtiqueta[pedido.id]}</p>
                  )}
                </div>
              )}
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
