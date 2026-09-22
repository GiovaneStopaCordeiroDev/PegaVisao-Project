import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getUsuarioLogado } from "../../services/auth";
import "./carrinho.css";

export function Carrinho() {
  const navigate = useNavigate();

  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    const carrinhoSalvo = JSON.parse(localStorage.getItem("carrinho")) || [];

    setCarrinho(carrinhoSalvo);
  }, []);

  function finalizarCompra() {
    const usuario = getUsuarioLogado();

    if (!usuario) {
      toast.error("Faça login para finalizar sua compra.");

      navigate("/login", {
        state: {
          redirectTo: "/checkout",
        },
      });

      return;
    }

    navigate("/checkout");
  }

  function removerItem(index) {
    toast.warning("Excluir produto?", {
      description: "Tem certeza que deseja remover este produto do carrinho?",

      action: {
        label: "Excluir",

        onClick: () => {
          const novoCarrinho = [...carrinho];

          novoCarrinho.splice(index, 1);

          setCarrinho(novoCarrinho);

          localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));

          toast.success("Produto removido do carrinho");
        },
      },

      cancel: {
        label: "Cancelar",
      },
    });
  }

  const subtotal = carrinho.reduce((total, item) => {
    return total + Number(item.preco) * Number(item.quantidade);
  }, 0);

  const total = subtotal;

  return (
    <main className="pagina-carrinho">
      <div className="cabecalho-carrinho">
        <h1>Meu Carrinho</h1>

        <p>Confira os produtos que você adicionou.</p>
      </div>

      {carrinho.length === 0 ? (
        <div className="carrinho-vazio">
          <h2>Seu carrinho está vazio</h2>

          <p>Adicione algum produto para continuar.</p>
        </div>
      ) : (
        <div className="conteudo-carrinho">
          {/* ITENS DO PEDIDO */}

          <section className="itens-carrinho">
            <h2>Itens do pedido</h2>

            {carrinho.map((item, index) => (
              <div
                className="card-carrinho"
                key={`${item.variacaoId}-${index}`}
              >
                <button
                  className="botao-remover"
                  onClick={() => removerItem(index)}
                >
                  ✕
                </button>

                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="imagem-carrinho"
                />

                <div className="informacoes-carrinho">
                  <h3>{item.nome}</h3>

                  <p>Cor: {item.cor}</p>

                  <p>Tamanho: {item.tamanho}</p>

                  <p>Quantidade: {item.quantidade}</p>

                  <strong>
                    R$ {Number(item.preco).toFixed(2).replace(".", ",")}
                  </strong>
                </div>
              </div>
            ))}
          </section>

          {/* RESUMO DO PEDIDO */}

          <aside className="resumo-pedido">
            <h2>Resumo do pedido</h2>

            <div className="linha-resumo">
              <span>Itens</span>

              <span>{carrinho.length}</span>
            </div>

            <div className="linha-resumo">
              <span>Subtotal</span>

              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>

            <hr />

            <div className="linha-total">
              <span>Total</span>

              <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
            </div>

            <button className="botao-pagamento" onClick={finalizarCompra}>
              Finalizar compra
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
