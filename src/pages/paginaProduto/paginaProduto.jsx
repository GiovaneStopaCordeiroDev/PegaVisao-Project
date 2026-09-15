import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../../services/api";

import "./PaginaProduto.css";

export function PaginaProduto() {

  const { id } = useParams();

  const [produto, setProduto] = useState(null);

  const [corSelecionada, setCorSelecionada] = useState("");

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");

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

        console.error("Erro ao carregar produto:", error);

      }

    }

    carregarProduto();

  }, [id]);


  // =========================
  // CARREGANDO
  // =========================

  if (!produto) {

    return (
      <div className="pagina-produto-carregando">

        <h2>Carregando produto...</h2>

      </div>
    );

  }


  // =========================
  // CORES DISPONÍVEIS
  // =========================

  const cores = [
    ...new Set(
      produto.variacoes.map(
        (variacao) => variacao.cor
      )
    )
  ];


  // =========================
  // TAMANHOS DA COR SELECIONADA
  // =========================

  const variacoesDaCor = produto.variacoes.filter(
    (variacao) => variacao.cor === corSelecionada
  );

  const tamanhos = [
    ...new Set(
      variacoesDaCor.map(
        (variacao) => variacao.tamanho
      )
    )
  ];


  // =========================
  // VARIAÇÃO SELECIONADA
  // =========================

  const variacaoSelecionada = produto.variacoes.find(
    (variacao) =>
      variacao.cor === corSelecionada &&
      variacao.tamanho === tamanhoSelecionado
  );


  // =========================
  // SELECIONAR COR
  // =========================

  function selecionarCor(cor) {

    setCorSelecionada(cor);

    // Reseta o tamanho porque
    // ele pode não existir na nova cor
    setTamanhoSelecionado("");

  }


  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function adicionarAoCarrinho() {

    if (!corSelecionada || !tamanhoSelecionado) {

      alert("Selecione a cor e o tamanho.");

      return;

    }

    if (!variacaoSelecionada) {

      alert("Essa combinação não está disponível.");

      return;

    }

    if (variacaoSelecionada.estoque <= 0) {

      alert("Produto sem estoque.");

      return;

    }


    // =========================
    // CRIAR ITEM DO CARRINHO
    // =========================

    const item = {

      produtoId: produto.id,

      variacaoId: variacaoSelecionada.id,

      nome: produto.nome,

      preco: produto.preco,

      imagem: produto.imagemPrincipal,

      cor: corSelecionada,

      tamanho: tamanhoSelecionado,

      quantidade: 1

    };


    // =========================
    // PEGAR CARRINHO ATUAL
    // =========================

    const carrinhoAtual =
      JSON.parse(
        localStorage.getItem("carrinho")
      ) || [];


    // =========================
    // ADICIONAR ITEM
    // =========================

    carrinhoAtual.push(item);


    // =========================
    // SALVAR CARRINHO
    // =========================

    localStorage.setItem(
      "carrinho",
      JSON.stringify(carrinhoAtual)
    );


    console.log(
      "PRODUTO ADICIONADO AO CARRINHO:",
      item
    );


    alert("Produto adicionado ao carrinho!");

  }


  return (

    <main className="pagina-produto">

      <div className="produto-container">


        {/* =========================
                    IMAGEM
                ========================= */}

        <div className="produto-imagem-container">

          <img
            src={produto.imagemPrincipal}
            alt={produto.nome}
            className="produto-imagem"
          />

        </div>


        {/* =========================
                    INFORMAÇÕES
                ========================= */}

        <div className="produto-informacoes">

          <h1 className="produto-nome">
            {produto.nome}
          </h1>


          <p className="produto-descricao">
            {produto.descricao}
          </p>


          <div className="produto-preco">

            R$ {
              Number(produto.preco)
                .toFixed(2)
                .replace(".", ",")
            }

          </div>


          {/* =========================
                        COR
                    ========================= */}

          <div className="selecao-produto">

            <h3>Cor</h3>

            <div className="opcoes-produto">

              {cores.map((cor) => (

                <button
                  key={cor}

                  className={`opcao-produto ${
                    corSelecionada === cor
                      ? "opcao-selecionada"
                      : ""
                  }`}

                  onClick={() => selecionarCor(cor)}
                >

                  {cor}

                </button>

              ))}

            </div>

          </div>


          {/* =========================
                        TAMANHO
                    ========================= */}

          {corSelecionada && (

            <div className="selecao-produto">

              <h3>Tamanho</h3>

              <div className="opcoes-produto">

                {tamanhos.map((tamanho) => {

                  const variacao =
                    variacoesDaCor.find(
                      (v) =>
                        v.tamanho === tamanho
                    );

                  const semEstoque =
                    !variacao ||
                    variacao.estoque <= 0;

                  return (

                    <button
                      key={tamanho}

                      className={`opcao-produto ${
                        tamanhoSelecionado === tamanho
                          ? "opcao-selecionada"
                          : ""
                      } ${
                        semEstoque
                          ? "opcao-indisponivel"
                          : ""
                      }`}

                      disabled={semEstoque}

                      onClick={() =>
                        setTamanhoSelecionado(tamanho)
                      }
                    >

                      {tamanho}

                    </button>

                  );

                })}

              </div>

            </div>

          )}


          {/* =========================
                        ESTOQUE
                    ========================= */}

          {variacaoSelecionada && (

            <div className="estoque-produto">

              {variacaoSelecionada.estoque > 0

                ? `Estoque disponível: ${variacaoSelecionada.estoque} unidade(s)`

                : "Produto sem estoque"

              }

            </div>

          )}


          {/* =========================
                    BOTÃO CARRINHO
                ========================= */}

          <button

            className="botao-adicionar-carrinho"

            onClick={adicionarAoCarrinho}

            disabled={
              variacaoSelecionada &&
              variacaoSelecionada.estoque <= 0
            }

          >

            Adicionar ao carrinho

          </button>

        </div>

      </div>


      {/* =========================
                DESCRIÇÃO
            ========================= */}

      <section className="descricao-completa">

        <h2>
          Descrição do produto
        </h2>

        <p>
          {produto.descricao}
        </p>

      </section>

    </main>

  );

}
