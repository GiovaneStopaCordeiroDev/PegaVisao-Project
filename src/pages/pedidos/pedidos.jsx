import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../../services/api";
import { concluirPixPendente } from "../../services/pixPendente";

import "./pedidos.css";

export function Pedidos() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    try {
      setCarregando(true);

      const response = await api.get("/Pedido");

      setPedidos(response.data);
      response.data.forEach(concluirPixPendente);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);

      if (error.response?.status === 401) {
        toast.error("Sua sessão expirou. Faça login novamente.");

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        navigate("/login");

        return;
      }

      toast.error("Não foi possível carregar seus pedidos.");
    } finally {
      setCarregando(false);
    }
  }

  function cancelarPedido(pedidoId) {
    toast.custom(
      (t) => (
        <div className="confirmacao-cancelamento">
          <strong>Cancelar pedido #{pedidoId}?</strong>

          <p>Tem certeza que deseja cancelar este pedido?</p>

          <div className="acoes-confirmacao">
            <button
              type="button"
              className="botao-voltar-confirmacao"
              onClick={() => toast.dismiss(t)}
            >
              Voltar
            </button>

            <button
              type="button"
              className="botao-confirmar-cancelamento"
              onClick={async () => {
                toast.dismiss(t);

                try {
                  setCancelando(pedidoId);

                  await api.put(`/Pedido/${pedidoId}/cancelar`);

                  toast.success("Pedido cancelado com sucesso.");

                  setPedidos((pedidosAtuais) =>
                    pedidosAtuais.map((pedido) =>
                      pedido.id === pedidoId
                        ? {
                            ...pedido,
                            status: "Cancelado",
                          }
                        : pedido,
                    ),
                  );
                } catch (error) {
                  console.error("Erro ao cancelar pedido:", error);

                  if (error.response?.status === 401) {
                    toast.error("Sua sessão expirou. Faça login novamente.");

                    localStorage.removeItem("token");

                    localStorage.removeItem("usuario");

                    navigate("/login");

                    return;
                  }

                  const mensagem =
                    error.response?.data?.mensagem ||
                    "Não foi possível cancelar o pedido.";

                  toast.error(mensagem);
                } finally {
                  setCancelando(null);
                }
              }}
            >
              Cancelar pedido
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  }

  function formatarData(data) {
    if (!data) {
      return "";
    }

    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatarHora(data) {
    if (!data) {
      return "";
    }

    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarValor(valor) {
    return Number(valor).toFixed(2).replace(".", ",");
  }

  function formatarStatus(status) {
    switch (status) {
      case "Pendente":
        return "Pendente";

      case "Enviado":
        return "Enviado";

      case "Entregue":
        return "Entregue";

      case "Cancelado":
        return "Cancelado";

      default:
        return status;
    }
  }

  function classeStatus(status) {
    switch (status) {
      case "Pago":
        return "status-entregue";
      case "Pendente":
        return "status-pendente";

      case "Enviado":
        return "status-enviado";

      case "Entregue":
        return "status-entregue";

      case "Cancelado":
        return "status-cancelado";

      default:
        return "";
    }
  }

  if (carregando) {
    return (
      <main className="pagina-pedidos">
        <div className="carregando-pedidos">
          <h1>Meus pedidos</h1>
          <p>Carregando seus pedidos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pagina-pedidos">
      <div className="cabecalho-pedidos">
        <h1>Meus pedidos</h1>

        <p>Acompanhe seus pedidos e entregas.</p>
      </div>

      {pedidos.length === 0 ? (
        <section className="pedidos-vazio">
          <h2>Você ainda não possui pedidos.</h2>

          <p>Quando realizar uma compra, seus pedidos aparecerão aqui.</p>

          <button type="button" onClick={() => navigate("/produtos")}>
            Ver produtos
          </button>
        </section>
      ) : (
        <section className="lista-pedidos">
          {pedidos.map((pedido) => (
            <article className="card-pedido" key={pedido.id}>
              <div className="cabecalho-card-pedido">
                <div>
                  <span className="label-pedido">Pedido</span>

                  <h2>#{pedido.id}</h2>
                </div>

                <div className={`status-pedido ${classeStatus(pedido.status)}`}>
                  {formatarStatus(pedido.status)}
                </div>
              </div>

              <div className="informacoes-pedido">
                <div className="informacao-pedido">
                  <span>Data</span>

                  <strong>{formatarData(pedido.dataPedido)}</strong>

                  <small>{formatarHora(pedido.dataPedido)}</small>
                </div>

                <div className="informacao-pedido">
                  <span>Pagamento</span>

                  <strong>{pedido.formaPagamento}</strong>
                </div>

                <div className="informacao-pedido">
                  <span>Total</span>

                  <strong>R$ {formatarValor(pedido.valorTotal)}</strong>
                </div>
              </div>

              <div className="itens-pedido">
                <h3>Produtos</h3>

                <div className="lista-itens-pedido">
                  {pedido.itens?.map((item) => (
                    <div className="item-pedido" key={item.id}>
                      {item.imagemProduto ? (
                        <img
                          className="imagem-item-pedido"
                          src={item.imagemProduto}
                          alt={item.nomeProduto}
                        />
                      ) : (
                        <div className="imagem-item-pedido sem-imagem">
                          Sem imagem
                        </div>
                      )}

                      <div className="dados-produto-pedido">
                        <strong className="nome-produto-pedido">
                          {item.nomeProduto}
                        </strong>

                        <div className="variacoes-produto-pedido">
                          {item.cor && <span>Cor: {item.cor}</span>}

                          {item.tamanho && <span>Tamanho: {item.tamanho}</span>}
                        </div>

                        <span className="quantidade-produto-pedido">
                          Quantidade: {item.quantidade}
                        </span>
                      </div>

                      <div className="preco-produto-pedido">
                        <span>Preço unitário</span>

                        <strong>R$ {formatarValor(item.precoUnitario)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="endereco-pedido">
                <h3>Endereço de entrega</h3>

                <p>
                  {pedido.rua}, {pedido.numero}
                  {pedido.complemento && ` - ${pedido.complemento}`}
                </p>

                <p>
                  {pedido.bairro} - {pedido.cidade} / {pedido.estado}
                </p>

                <p>CEP: {pedido.cep}</p>
              </div>

              {pedido.status === "Pendente" && (
                <div className="acoes-pedido">
                  <button
                    type="button"
                    className="botao-cancelar-pedido"
                    onClick={() => cancelarPedido(pedido.id)}
                    disabled={cancelando === pedido.id}
                  >
                    {cancelando === pedido.id
                      ? "Cancelando..."
                      : "Cancelar pedido"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
