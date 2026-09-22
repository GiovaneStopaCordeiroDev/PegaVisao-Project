import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import api from "../../services/api";

import { toast } from "sonner";

import "./PaginaProduto.css";

export function PaginaProduto() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [produto, setProduto] = useState(null);

  const [corSelecionada, setCorSelecionada] = useState("");

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");

  const [quantidade, setQuantidade] = useState(1);

  // =========================
  // CARREGAR PRODUTO
  // =========================

  useEffect(() => {
    async function carregarProduto() {
      try {
        const response = await api.get(`/Produto/${id}`);

        console.log("PRODUTO:", response.data);

        setProduto(response.data);
      } catch (error) {
        console.error(
          "Erro ao carregar produto:",
          error
        );

        toast.error("Não foi possível carregar o produto.");
      }
    }

    carregarProduto();
  }, [id]);

  // =========================
  // CARREGANDO
  // =========================

  if (!produto) {
    return (
      <main className="pagina-produto-carregando">
        <div className="loader-produto"></div>

        <h2>Carregando produto...</h2>
      </main>
    );
  }

  // =========================
  // CORES DISPONÍVEIS
  // =========================

  const cores = [
    ...new Set(
      produto.variacoes?.map(
        (variacao) => variacao.cor
      )
    ),
  ];

  // =========================
  // TAMANHOS DA COR
  // =========================

  const variacoesDaCor =
    produto.variacoes?.filter(
      (variacao) =>
        variacao.cor === corSelecionada
    ) || [];

  const tamanhos = [
    ...new Set(
      variacoesDaCor.map(
        (variacao) => variacao.tamanho
      )
    ),
  ];

  // =========================
  // VARIAÇÃO SELECIONADA
  // =========================

  const variacaoSelecionada =
    produto.variacoes?.find(
      (variacao) =>
        variacao.cor === corSelecionada &&
        variacao.tamanho === tamanhoSelecionado
    );

  // =========================
  // SELECIONAR COR
  // =========================

  function selecionarCor(cor) {
    setCorSelecionada(cor);

    setTamanhoSelecionado("");

    setQuantidade(1);
  }

  // =========================
  // AUMENTAR QUANTIDADE
  // =========================

  function aumentarQuantidade() {
    if (!variacaoSelecionada) {
      return;
    }

    if (
      quantidade <
      (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque)
    ) {
      setQuantidade((valor) => valor + 1);
    }
  }

  // =========================
  // DIMINUIR QUANTIDADE
  // =========================

  function diminuirQuantidade() {
    if (quantidade > 1) {
      setQuantidade((valor) => valor - 1);
    }
  }

  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function adicionarAoCarrinho() {
    if (!corSelecionada) {
      toast.error("Selecione uma cor.");
      return;
    }

    if (!tamanhoSelecionado) {
      toast.error("Selecione um tamanho.");
      return;
    }

    if (!variacaoSelecionada) {
      toast.error(
        "Essa combinação não está disponível."
      );
      return;
    }

    if ((variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque) <= 0) {
      toast.error("Produto sem estoque.");
      return;
    }

    if (
      quantidade >
      (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque)
    ) {
      toast.error(
        "Quantidade maior que o estoque disponível."
      );
      return;
    }

    // =========================
    // CRIAR ITEM
    // =========================

    const item = {
      produtoId: produto.id,

      variacaoId:
        variacaoSelecionada.id,

      nome: produto.nome,

      preco: produto.preco,

      imagem: produto.imagemPrincipal,

      cor: corSelecionada,

      tamanho: tamanhoSelecionado,

      quantidade: quantidade,
    };

    // =========================
    // PEGAR CARRINHO
    // =========================

    const carrinhoAtual =
      JSON.parse(
        localStorage.getItem("carrinho")
      ) || [];

    // =========================
    // VERIFICAR ITEM EXISTENTE
    // =========================

    const itemExistente =
      carrinhoAtual.find(
        (itemCarrinho) =>
          itemCarrinho.produtoId ===
            item.produtoId &&
          itemCarrinho.variacaoId ===
            item.variacaoId
      );

    if (itemExistente) {
      const novaQuantidade =
        itemExistente.quantidade +
        quantidade;

      if (
        novaQuantidade >
        (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque)
      ) {
        toast.error(
          "Você atingiu o limite de estoque desse produto."
        );

        return;
      }

      itemExistente.quantidade =
        novaQuantidade;
    } else {
      carrinhoAtual.push(item);
    }

    // =========================
    // SALVAR
    // =========================

    localStorage.setItem(
      "carrinho",
      JSON.stringify(carrinhoAtual)
    );

    console.log(
      "PRODUTO ADICIONADO AO CARRINHO:",
      item
    );

    toast.success(
      "Produto adicionado ao carrinho!"
    );
  }

  return (
    <main className="pagina-produto">

      {/* =================================
                    PRODUTO
      ================================= */}

      <section className="produto-container">

        {/* =================================
                    IMAGEM
        ================================= */}

        <div className="produto-imagem-container">

          <img
            src={produto.imagemPrincipal}
            alt={produto.nome}
            className="produto-imagem"
          />

        </div>

        {/* =================================
                    INFORMAÇÕES
        ================================= */}

        <div className="produto-informacoes">

          <div className="produto-categoria">
            PegaVisão
          </div>

          <h1 className="produto-nome">
            {produto.nome}
          </h1>

          <p className="produto-descricao">
            {produto.descricao}
          </p>

          <div className="produto-preco">

            R${" "}
            {Number(produto.preco)
              .toFixed(2)
              .replace(".", ",")}

          </div>

          <p className="produto-parcelamento">
            Consulte as condições de pagamento
          </p>

          <div className="linha-produto"></div>

          {/* =================================
                        COR
          ================================= */}

          <div className="selecao-produto">

            <div className="titulo-selecao">

              <h3>
                Cor
              </h3>

              {corSelecionada && (
                <span>
                  {corSelecionada}
                </span>
              )}

            </div>

            <div className="opcoes-produto">

              {cores.map((cor) => (

                <button
                  key={cor}
                  type="button"
                  className={`opcao-produto ${
                    corSelecionada === cor
                      ? "opcao-selecionada"
                      : ""
                  }`}
                  onClick={() =>
                    selecionarCor(cor)
                  }
                >
                  {cor}
                </button>

              ))}

            </div>

          </div>

          {/* =================================
                        TAMANHO
          ================================= */}

          {corSelecionada && (

            <div className="selecao-produto">

              <div className="titulo-selecao">

                <h3>
                  Tamanho
                </h3>

                {tamanhoSelecionado && (
                  <span>
                    {tamanhoSelecionado}
                  </span>
                )}

              </div>

              <div className="opcoes-produto">

                {tamanhos.map((tamanho) => {

                  const variacao =
                    variacoesDaCor.find(
                      (variacao) =>
                        variacao.tamanho ===
                        tamanho
                    );

                  const semEstoque =
                    !variacao ||
                    (variacao.estoqueDisponivel ?? variacao.estoque) <= 0;

                  return (

                    <button
                      key={tamanho}
                      type="button"
                      className={`opcao-produto ${
                        tamanhoSelecionado ===
                        tamanho
                          ? "opcao-selecionada"
                          : ""
                      } ${
                        semEstoque
                          ? "opcao-indisponivel"
                          : ""
                      }`}
                      disabled={semEstoque}
                      onClick={() =>
                        setTamanhoSelecionado(
                          tamanho
                        )
                      }
                    >
                      {tamanho}
                    </button>

                  );
                })}

              </div>

            </div>

          )}

          {/* =================================
                        ESTOQUE
          ================================= */}

          {variacaoSelecionada && (

            <div
              className={`estoque-produto ${
                (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque) <= 0
                  ? "estoque-esgotado"
                  : ""
              }`}
            >

              {(variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque) >
              0
                ? `Em estoque: ${(variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque)} unidade(s)`
                : "Produto sem estoque"}

            </div>

          )}

          {/* =================================
                        QUANTIDADE
          ================================= */}

          {variacaoSelecionada &&
            (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque) > 0 && (

              <div className="quantidade-container">

                <h3>
                  Quantidade
                </h3>

                <div className="controle-quantidade">

                  <button
                    type="button"
                    onClick={
                      diminuirQuantidade
                    }
                    disabled={
                      quantidade <= 1
                    }
                  >
                    −
                  </button>

                  <span>
                    {quantidade}
                  </span>

                  <button
                    type="button"
                    onClick={
                      aumentarQuantidade
                    }
                    disabled={
                      quantidade >=
                      (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque)
                    }
                  >
                    +
                  </button>

                </div>

              </div>

            )}

          {/* =================================
                    BOTÃO CARRINHO
          ================================= */}

          <button
            type="button"
            className="botao-adicionar-carrinho"
            onClick={
              adicionarAoCarrinho
            }
            disabled={
              variacaoSelecionada &&
              (variacaoSelecionada.estoqueDisponivel ?? variacaoSelecionada.estoque) <= 0
            }
          >
            Adicionar ao carrinho
          </button>

          {/* =================================
                    IR PARA CARRINHO
          ================================= */}

          <button
            type="button"
            className="botao-ver-carrinho"
            onClick={() =>
              navigate("/carrinho")
            }
          >
            Ver carrinho
          </button>

          {/* =================================
                    INFORMAÇÕES
          ================================= */}

          <div className="informacoes-compra">

            <div className="item-informacao">

              <span className="icone-informacao">
                ✓
              </span>

              <div>
                <strong>
                  Produto disponível
                </strong>

                <p>
                  Consulte as variações disponíveis.
                </p>
              </div>

            </div>

            <div className="item-informacao">

              <span className="icone-informacao">
                ↻
              </span>

              <div>
                <strong>
                  Compra segura
                </strong>

                <p>
                  Seus produtos ficam salvos no carrinho.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================
                DESCRIÇÃO COMPLETA
      ================================= */}

      <section className="descricao-completa">

        <div className="descricao-titulo">

          <span>
            DETALHES
          </span>

          <h2>
            Descrição do produto
          </h2>

        </div>

        <p>
          {produto.descricao}
        </p>

      </section>

    </main>
  );
}