import { useEffect, useState } from "react";

import { toast } from "sonner";

import "./carrinho.css";

export function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);

  const [pagamentoAberto, setPagamentoAberto] = useState(false);

  const [formaPagamento, setFormaPagamento] = useState("");

  useEffect(() => {
    const carrinhoSalvo = JSON.parse(localStorage.getItem("carrinho")) || [];

    setCarrinho(carrinhoSalvo);
  }, []);

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

          <section className="itens-pedido">
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

            <div className="linha-resumo">
              <span>Frete</span>

              <span>R$ 0,00</span>
            </div>

            <hr />

            <div className="linha-total">
              <span>Total</span>

              <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
            </div>

            <button
              className="botao-pagamento"
              onClick={() => setPagamentoAberto(true)}
            >
              Escolher forma de pagamento
            </button>
          </aside>
        </div>
      )}

      {/* MODAL DE PAGAMENTO */}

      {pagamentoAberto && (
        <div className="modal-overlay">
          <div className="modal-pagamento">
            <button
              className="fechar-modal"
              onClick={() => setPagamentoAberto(false)}
            >
              ×
            </button>

            <h2>Forma de pagamento</h2>

            <p>Escolha como deseja pagar.</p>

            <label className="opcao-pagamento">
              <input
                type="radio"
                name="pagamento"
                value="PIX"
                checked={formaPagamento === "PIX"}
                onChange={(event) => setFormaPagamento(event.target.value)}
              />

              <span>PIX</span>
            </label>

            <label className="opcao-pagamento">
              <input
                type="radio"
                name="pagamento"
                value="Cartão de crédito"
                checked={formaPagamento === "Cartão de crédito"}
                onChange={(event) => setFormaPagamento(event.target.value)}
              />

              <span>Cartão de crédito</span>
            </label>

            <label className="opcao-pagamento">
              <input
                type="radio"
                name="pagamento"
                value="Cartão de débito"
                checked={formaPagamento === "Cartão de débito"}
                onChange={(event) => setFormaPagamento(event.target.value)}
              />

              <span>Cartão de débito</span>
            </label>

            <button
              className="botao-continuar-pagamento"
              disabled={!formaPagamento}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
