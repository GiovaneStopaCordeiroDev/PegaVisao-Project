import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "sonner";
import "./painelAdmin.css";

export function PainelAdmin() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [variacoesEditando, setVariacoesEditando] = useState([]);
  const [adicionandoProduto, setAdicionandoProduto] = useState(false);
  const [variacoes, setVariacoes] = useState([]);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagemPrincipal: "",
    categoriaId: "",
  });

  // =========================
  // CARREGAR PRODUTOS E CATEGORIAS
  // =========================

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
  }, []);

  async function carregarProdutos() {
    try {
      const response = await api.get("/Produto");

      console.log("PRODUTOS DO PAINEL:", response.data);

      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      console.error("RESPOSTA DO SERVIDOR:", error.response?.data);

      toast.error("Não foi possível carregar os produtos.");
    }
  }

  async function carregarCategorias() {
    try {
      const response = await api.get("/Categoria");

      console.log("CATEGORIAS:", response.data);

      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      console.error("RESPOSTA DO SERVIDOR:", error.response?.data);

      toast.error("Não foi possível carregar as categorias.");
    }
  }

  // =========================
  // EDITAR PRODUTO
  // =========================

  function abrirEdicao(produto) {
    setProdutoEditando({
      ...produto,
    });

    setVariacoesEditando(
      produto.variacoes
        ? produto.variacoes.map((variacao) => ({
            id: variacao.id,
            cor: variacao.cor,
            tamanho: variacao.tamanho,
            estoque: variacao.estoque,
          }))
        : [],
    );
  }

  function fecharEdicao() {
    setProdutoEditando(null);
    setVariacoesEditando([]);
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setProdutoEditando((produto) => ({
      ...produto,
      [name]: value,
    }));
  }

  // =========================
  // ALTERAR VARIAÇÃO DA EDIÇÃO
  // =========================

  function alterarVariacaoEditando(index, campo, valor) {
    const novasVariacoes = [...variacoesEditando];

    novasVariacoes[index][campo] = valor;

    setVariacoesEditando(novasVariacoes);
  }

  // =========================
  // ADICIONAR VARIAÇÃO NA EDIÇÃO
  // =========================

  function adicionarVariacaoEditando() {
    setVariacoesEditando([
      ...variacoesEditando,
      {
        id: 0,
        cor: "",
        tamanho: "",
        estoque: 0,
      },
    ]);
  }

  // =========================
  // REMOVER VARIAÇÃO DA EDIÇÃO
  // =========================

  function removerVariacaoEditando(index) {
    const novasVariacoes = variacoesEditando.filter((_, i) => i !== index);

    setVariacoesEditando(novasVariacoes);
  }

  // =========================
  // SALVAR PRODUTO EDITADO
  // =========================

  async function alterarProduto(event) {
    event.preventDefault();

    try {
      const produtoAtualizado = {
        nome: produtoEditando.nome,
        descricao: produtoEditando.descricao,
        preco: Number(produtoEditando.preco),
        imagemPrincipal: produtoEditando.imagemPrincipal,
        categoriaId: Number(produtoEditando.categoriaId),

        variacoes: variacoesEditando.map((variacao) => ({
          id: Number(variacao.id),
          cor: variacao.cor,
          tamanho: variacao.tamanho,
          estoque: Number(variacao.estoque),
        })),
      };

      console.log("PRODUTO EDITADO SENDO ENVIADO:", produtoAtualizado);

      await api.put(`/Produto/${produtoEditando.id}`, produtoAtualizado);

      toast.success("Produto alterado com sucesso!", {
        description: "As informações do produto foram atualizadas.",
      });

      fecharEdicao();

      carregarProdutos();
    } catch (error) {
      console.error("Erro ao alterar produto:", error);
      console.error("RESPOSTA DO SERVIDOR:", error.response?.data);

      toast.error("Não foi possível alterar o produto.", {
        description: "Verifique os dados e tente novamente.",
      });
    }
  }

  // =========================
  // EXCLUIR PRODUTO
  // =========================

  function excluirProduto(id) {
    toast.warning("Excluir este produto?", {
      description: "Essa ação não poderá ser desfeita.",

      action: {
        label: "Excluir",

        onClick: async () => {
          try {
            await api.delete(`/Produto/${id}`);

            toast.success("Produto excluído com sucesso!", {
              description: "O produto foi removido da loja.",
            });

            carregarProdutos();
          } catch (error) {
            console.error("Erro ao excluir produto:", error);
            console.error("RESPOSTA DO SERVIDOR:", error.response?.data);

            toast.error("Não foi possível excluir o produto.", {
              description: "Verifique se o produto pode ser removido.",
            });
          }
        },
      },

      cancel: {
        label: "Cancelar",
      },
    });
  }

  // =========================
  // ADICIONAR PRODUTO
  // =========================

  function alterarCampoNovoProduto(event) {
    const { name, value } = event.target;

    setNovoProduto((produto) => ({
      ...produto,
      [name]: value,
    }));
  }

  // =========================
  // ADICIONAR VARIAÇÃO
  // =========================

  function adicionarVariacao() {
    setVariacoes([
      ...variacoes,
      {
        cor: "",
        tamanho: "",
        estoque: 0,
      },
    ]);
  }

  // =========================
  // ALTERAR VARIAÇÃO
  // =========================

  function alterarVariacao(index, campo, valor) {
    const novasVariacoes = [...variacoes];

    novasVariacoes[index][campo] = valor;

    setVariacoes(novasVariacoes);
  }

  // =========================
  // REMOVER VARIAÇÃO
  // =========================

  function removerVariacao(index) {
    const novasVariacoes = variacoes.filter((_, i) => i !== index);

    setVariacoes(novasVariacoes);
  }

  // =========================
  // ENVIAR PRODUTO
  // =========================

  async function adicionarProduto(event) {
    event.preventDefault();

    try {
      const produto = {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: Number(novoProduto.preco),
        imagemPrincipal: novoProduto.imagemPrincipal,
        categoriaId: Number(novoProduto.categoriaId),

        variacoes: variacoes.map((variacao) => ({
          cor: variacao.cor,
          tamanho: variacao.tamanho,
          estoque: Number(variacao.estoque),
        })),
      };

      console.log("PRODUTO SENDO ENVIADO:", produto);

      await api.post("/Produto", produto);

      toast.success("Produto adicionado com sucesso!", {
        description: "O produto já está disponível na loja.",
      });

      setAdicionandoProduto(false);

      setVariacoes([]);

      setNovoProduto({
        nome: "",
        descricao: "",
        preco: "",
        imagemPrincipal: "",
        categoriaId: "",
      });

      carregarProdutos();
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      console.error("RESPOSTA DO SERVIDOR:", error.response?.data);

      toast.error("Não foi possível adicionar o produto.", {
        description: "Verifique os dados e tente novamente.",
      });
    }
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="painel-admin">
      {/* =========================
          TÍTULO + ADICIONAR
      ========================= */}

      <div className="titulo-produtos">
        <h1 className="h1-produtos">Produtos</h1>

        <button
          className="botao-adicionar-produto"
          onClick={() => setAdicionandoProduto(true)}
        >
          + Adicionar produto
        </button>
      </div>

      {/* =========================
          LISTA DE PRODUTOS
      ========================= */}

      <div className="lista-produtos-admin">
        {produtos.map((produto) => (
          <div className="card-produto-admin" key={produto.id}>
            <img
              src={produto.imagemPrincipal}
              alt={produto.nome}
              className="imagem-produto-admin"
            />

            <h2>{produto.nome}</h2>

            <p>R$ {Number(produto.preco).toFixed(2)}</p>

            <div className="acoes-produto">
              <button
                className="botao-editar"
                onClick={() => abrirEdicao(produto)}
              >
                Editar
              </button>

              <button
                className="botao-excluir"
                onClick={() => excluirProduto(produto.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          MODAL DE EDIÇÃO
      ========================= */}

      {produtoEditando && (
        <div className="modal-overlay">
          <div className="modal-editar">
            <button className="botao-fechar-modal" onClick={fecharEdicao}>
              ×
            </button>

            <h2>Editar produto</h2>

            <form onSubmit={alterarProduto}>
              {/* NOME */}

              <label>Nome</label>

              <input
                type="text"
                name="nome"
                value={produtoEditando.nome}
                onChange={alterarCampo}
                required
              />

              {/* DESCRIÇÃO */}

              <label>Descrição</label>

              <textarea
                name="descricao"
                value={produtoEditando.descricao}
                onChange={alterarCampo}
                required
              />

              {/* PREÇO */}

              <label>Preço</label>

              <input
                type="number"
                name="preco"
                step="0.01"
                value={produtoEditando.preco}
                onChange={alterarCampo}
                required
              />

              {/* IMAGEM */}

              <label>Imagem</label>

              <input
                type="text"
                name="imagemPrincipal"
                value={produtoEditando.imagemPrincipal}
                onChange={alterarCampo}
                required
              />

              {/* CATEGORIA */}

              <label>Categoria</label>

              <select
                name="categoriaId"
                value={produtoEditando.categoriaId}
                onChange={alterarCampo}
                required
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>

                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {/* VARIAÇÕES */}

              <div className="variacoes-container">
                <h3>Variações do produto</h3>

                {variacoesEditando.map((variacao, index) => (
                  <div
                    className="linha-variacao"
                    key={variacao.id > 0 ? variacao.id : `nova-${index}`}
                  >
                    <input
                      type="text"
                      placeholder="Cor"
                      value={variacao.cor}
                      onChange={(event) =>
                        alterarVariacaoEditando(
                          index,
                          "cor",
                          event.target.value,
                        )
                      }
                      required
                    />

                    <input
                      type="text"
                      placeholder="Tamanho"
                      value={variacao.tamanho}
                      onChange={(event) =>
                        alterarVariacaoEditando(
                          index,
                          "tamanho",
                          event.target.value,
                        )
                      }
                      required
                    />

                    <input
                      type="number"
                      placeholder="Estoque"
                      min="0"
                      value={variacao.estoque}
                      onChange={(event) =>
                        alterarVariacaoEditando(
                          index,
                          "estoque",
                          Number(event.target.value),
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      className="botao-remover-variacao"
                      onClick={() => removerVariacaoEditando(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="botao-adicionar-variacao"
                  onClick={adicionarVariacaoEditando}
                >
                  + Adicionar variação
                </button>
              </div>

              <button type="submit" className="botao-alterar">
                Alterar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          MODAL DE ADICIONAR
      ========================= */}

      {adicionandoProduto && (
        <div className="modal-overlay">
          <div className="modal-editar">
            <button
              className="botao-fechar-modal"
              onClick={() => {
                setAdicionandoProduto(false);
                setVariacoes([]);
              }}
            >
              ×
            </button>

            <h2>Adicionar produto</h2>

            <form onSubmit={adicionarProduto}>
              {/* NOME */}

              <label>Nome</label>

              <input
                type="text"
                name="nome"
                value={novoProduto.nome}
                onChange={alterarCampoNovoProduto}
                required
              />

              {/* DESCRIÇÃO */}

              <label>Descrição</label>

              <textarea
                name="descricao"
                value={novoProduto.descricao}
                onChange={alterarCampoNovoProduto}
                required
              />

              {/* PREÇO */}

              <label>Preço</label>

              <input
                type="number"
                name="preco"
                step="0.01"
                value={novoProduto.preco}
                onChange={alterarCampoNovoProduto}
                required
              />

              {/* IMAGEM */}

              <label>Imagem</label>

              <input
                type="text"
                name="imagemPrincipal"
                value={novoProduto.imagemPrincipal}
                onChange={alterarCampoNovoProduto}
                required
              />

              {/* CATEGORIA */}

              <label>Categoria</label>

              <select
                name="categoriaId"
                value={novoProduto.categoriaId}
                onChange={alterarCampoNovoProduto}
                required
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>

                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {/* VARIAÇÕES */}

              <div className="variacoes-container">
                <h3>Variações do produto</h3>

                {variacoes.map((variacao, index) => (
                  <div className="linha-variacao" key={index}>
                    <input
                      type="text"
                      placeholder="Cor"
                      value={variacao.cor}
                      onChange={(event) =>
                        alterarVariacao(index, "cor", event.target.value)
                      }
                    />

                    <input
                      type="text"
                      placeholder="Tamanho"
                      value={variacao.tamanho}
                      onChange={(event) =>
                        alterarVariacao(index, "tamanho", event.target.value)
                      }
                    />

                    <input
                      type="number"
                      placeholder="Estoque"
                      min="0"
                      value={variacao.estoque}
                      onChange={(event) =>
                        alterarVariacao(
                          index,
                          "estoque",
                          Number(event.target.value),
                        )
                      }
                    />

                    <button
                      type="button"
                      className="botao-remover-variacao"
                      onClick={() => removerVariacao(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="botao-adicionar-variacao"
                  onClick={adicionarVariacao}
                >
                  + Adicionar variação
                </button>
              </div>

              <button type="submit" className="botao-alterar">
                Adicionar produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
