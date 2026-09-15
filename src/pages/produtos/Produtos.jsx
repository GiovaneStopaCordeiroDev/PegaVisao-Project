import { useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import api from "../../services/api";

import "./Produtos.css";

export function Produtos() {
  const [produtos, setProdutos] = useState([]);

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [busca, setBusca] = useState("");

  const [categoria, setCategoria] = useState("");

  const [tamanho, setTamanho] = useState("");

  const [cor, setCor] = useState("");

  const [precoMaximo, setPrecoMaximo] = useState("");

  const [searchParams] = useSearchParams();

  // =========================================
  // CATEGORIAS
  // =========================================

  const categorias = [
    {
      id: 8,
      nome: "Camisetas",
    },
    {
      id: 6,
      nome: "Moletons",
    },
    {
      id: 7,
      nome: "Calças",
    },
    {
      id: 5,
      nome: "Tênis",
    },
  ];

  // =========================================
  // CARREGAR PRODUTOS
  // =========================================

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await api.get("/Produto");

        console.log("PRODUTOS:", response.data);

        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    }

    carregarProdutos();
  }, []);

  // =========================================
  // LER CATEGORIA DA URL
  // =========================================

  useEffect(() => {
    const categoriaUrl = searchParams.get("categoria");

    if (categoriaUrl) {
      setCategoria(categoriaUrl);
    }
  }, [searchParams]);

  // =========================================
  // LIMPAR TAMANHO AO TROCAR DE CATEGORIA
  // =========================================

  useEffect(() => {
    setTamanho("");
  }, [categoria]);

  // =========================================
  // OPÇÕES DE TAMANHO
  // =========================================

  const tamanhosRoupa = ["P", "M", "G", "GG", "G1", "G2", "XG"];

  const tamanhosTenis = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

  const tamanhos = categoria === "5" ? tamanhosTenis : tamanhosRoupa;

  // =========================================
  // OPÇÕES DE COR
  // =========================================

  const cores = [
    ...new Set(
      produtos.flatMap(
        (produto) => produto.variacoes?.map((variacao) => variacao.cor) || [],
      ),
    ),
  ];

  // =========================================
  // FILTRAR PRODUTOS
  // =========================================

  const produtosFiltrados = produtos.filter((produto) => {
    // =====================================
    // BUSCA
    // =====================================

    const textoBusca = busca.trim().toLowerCase();

    const nome = produto.nome?.toLowerCase() || "";

    const descricao = produto.descricao?.toLowerCase() || "";

    const correspondeBusca =
      textoBusca === "" ||
      nome.includes(textoBusca) ||
      descricao.includes(textoBusca);

    // =====================================
    // CATEGORIA
    // =====================================

    const correspondeCategoria =
      categoria === "" || produto.categoriaId === Number(categoria);

    // =====================================
    // TAMANHO
    // =====================================

    const correspondeTamanho =
      tamanho === "" ||
      produto.variacoes?.some(
        (variacao) => variacao.tamanho === tamanho && variacao.estoque > 0,
      );

    // =====================================
    // COR
    // =====================================

    const correspondeCor =
      cor === "" ||
      produto.variacoes?.some(
        (variacao) => variacao.cor === cor && variacao.estoque > 0,
      );

    // =====================================
    // PREÇO
    // =====================================

    const correspondePreco =
      precoMaximo === "" || Number(produto.preco) <= Number(precoMaximo);

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeTamanho &&
      correspondeCor &&
      correspondePreco
    );
  });

  // =========================================
  // LIMPAR FILTROS
  // =========================================

  function limparFiltros() {
    setBusca("");

    setCategoria("");

    setTamanho("");

    setCor("");

    setPrecoMaximo("");
  }

  // =========================================
  // RENDERIZAR CARD
  // =========================================

  function renderizarProduto(produto) {
    return (
      <Link
        key={produto.id}
        to={`/produto/${produto.id}`}
        className="produto-card-filtro"
      >
        <img src={produto.imagemPrincipal} alt={produto.nome} />

        <div className="produto-card-filtro-info">
          <h3 className="produto-card-nome">{produto.nome}</h3>

          <p className="produto-card-descricao">{produto.descricao}</p>

          <strong className="produto-card-preco">
            R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
          </strong>

          <button type="button" className="botao-carrinho-produto">
            Adicionar ao carrinho
          </button>
        </div>
      </Link>
    );
  }

  // =========================================
  // INTERFACE
  // =========================================

  return (
    <main className="pagina-produtos">
      {/* =====================================
                CABEÇALHO
            ===================================== */}

      <div className="topo-produtos">
        <h1>Produtos</h1>

        <div className="barra-busca">
          <span>🔎</span>

          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>
      </div>

      {/* =====================================
                BOTÃO FILTROS - MOBILE
            ===================================== */}

      <button
        className="botao-filtros-mobile"
        onClick={() => setFiltrosAbertos(!filtrosAbertos)}
      >
        <span>⚙ Filtros</span>

        <span>{filtrosAbertos ? "▲" : "▼"}</span>
      </button>

      {/* =====================================
                CONTEÚDO
            ===================================== */}

      <div className="conteudo-produtos">
        {/* ===================================
                    FILTROS
                =================================== */}

        <aside
          className={`filtros-produtos ${
            filtrosAbertos ? "filtros-abertos" : ""
          }`}
        >
          <div className="titulo-filtros">
            <h2>Filtros</h2>

            <button onClick={limparFiltros}>Limpar</button>
          </div>

          {/* =================================
                        CATEGORIA
                    ================================= */}

          <div className="grupo-filtro">
            <h3>Categoria</h3>

            {categorias.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="categoria"
                  checked={categoria === String(item.id)}
                  onChange={() => setCategoria(String(item.id))}
                />

                {item.nome}
              </label>
            ))}

            <label>
              <input
                type="radio"
                name="categoria"
                checked={categoria === ""}
                onChange={() => setCategoria("")}
              />
              Todas
            </label>
          </div>

          {/* =================================
                        TAMANHO
                    ================================= */}

          <div className="grupo-filtro">
            <h3>Tamanho</h3>

            <div className="opcoes-filtro">
              {tamanhos.map((item) => (
                <button
                  key={item}
                  className={tamanho === item ? "filtro-selecionado" : ""}
                  onClick={() => setTamanho(tamanho === item ? "" : item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* =================================
                        COR
                    ================================= */}

          <div className="grupo-filtro">
            <h3>Cor</h3>

            <select
              value={cor}
              onChange={(event) => setCor(event.target.value)}
            >
              <option value="">Todas as cores</option>

              {cores.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* =================================
                        PREÇO
                    ================================= */}

          <div className="grupo-filtro">
            <h3>Preço máximo</h3>

            <div className="campo-preco">
              <span>R$</span>

              <input
                type="number"
                min="0"
                placeholder="Ex: 130"
                value={precoMaximo}
                onChange={(event) => setPrecoMaximo(event.target.value)}
              />
            </div>
          </div>

          {/* =================================
                        LIMPAR
                    ================================= */}

          <button className="botao-limpar-filtros" onClick={limparFiltros}>
            Limpar filtros
          </button>
        </aside>

        {/* ===================================
                    PRODUTOS
                =================================== */}

        <section className="resultado-produtos">
          <div className="cabecalho-resultados">
            <p>
              <strong>{produtosFiltrados.length}</strong> produto(s)
              encontrado(s)
            </p>
          </div>

          {produtosFiltrados.length > 0 ? (
            <div className="grid-produtos-filtro">
              {produtosFiltrados.map((produto) => renderizarProduto(produto))}
            </div>
          ) : (
            <div className="nenhum-produto">
              <h2>Nenhum produto encontrado</h2>

              <p>Tente alterar ou remover alguns filtros.</p>

              <button onClick={limparFiltros}>Limpar filtros</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
