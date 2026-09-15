import api from "./services/api";
import { useState, useEffect } from "react";
import { Carrinho } from "./pages/carrinho/Carrinho";
import Footer from "./components/footer/footer";
import { Carrossel } from "./components/carrossel/carrossel";
import Header from "./components/header/header";
import { PainelAdmin } from "./components/painelAdmin/PainelAdmin";
import { Produtos } from "./pages/produtos/Produtos";
import { PaginaProduto } from "./pages/paginaProduto/paginaProduto";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import "./App.css";

function App() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");

  // =========================================
  // CARREGAR PRODUTOS
  // =========================================

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await api.get("/Produto");

        console.log("RESPOSTA DA API:", response.data);

        setProdutos(response.data);
      } catch (error) {
        console.error("ERRO:", error);
      }
    }

    carregarProdutos();
  }, []);

  // =========================================
  // BUSCA DE PRODUTOS
  // =========================================

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return false;
    }

    // Nome
    const nome = produto.nome?.toLowerCase() || "";

    // Descrição
    const descricao = produto.descricao?.toLowerCase() || "";

    // Categoria
    const categoria = produto.categoria?.nome?.toLowerCase() || "";

    // Variações
    const variacoes = produto.variacoes || [];

    const encontrouVariacao = variacoes.some((variacao) => {
      const cor = variacao.cor?.toLowerCase() || "";

      const tamanho = variacao.tamanho?.toLowerCase() || "";

      return cor.includes(termo) || tamanho.includes(termo);
    });

    return (
      nome.includes(termo) ||
      descricao.includes(termo) ||
      categoria.includes(termo) ||
      encontrouVariacao
    );
  });

  // =========================================
  // PRODUTOS POR CATEGORIA
  // =========================================

  const tenis = produtos.filter((produto) => produto.categoriaId === 5);

  const moletons = produtos.filter((produto) => produto.categoriaId === 6);

  const calcas = produtos.filter((produto) => produto.categoriaId === 7);

  const camisetas = produtos.filter((produto) => produto.categoriaId === 8);

  // =========================================
  // RENDERIZAR CARDS
  // =========================================

  function renderizarProdutos(lista) {
    return lista.map((produto) => (
      <Link
        key={produto.id}
        to={`/produto/${produto.id}`}
        className="card-produto"
      >
        <img
          src={produto.imagemPrincipal}
          alt={produto.nome}
          className="imagem-produto"
        />

        <div className="info-produto">
          <h3 className="nome-produto">{produto.nome}</h3>

          <p className="descricao-produto">{produto.descricao}</p>

          <p className="preco-produto">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>

          <button
            className="botao-carrinho-produto"
            onClick={(event) => event.preventDefault()}
          >
            Adicionar ao carrinho
          </button>
        </div>
      </Link>
    ));
  }

  // =========================================
  // INTERFACE
  // =========================================

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* =========================================
            HOME
        ========================================= */}

        <Route
          path="/"
          element={
            <>
              {/* =====================================
                  CARROSSEL
              ===================================== */}

              <section>
                <Carrossel />
              </section>

              {/* =====================================
                  BUSCA
              ===================================== */}

              <section className="busca-home">
                <div className="campo-busca">
                  <span className="icone-busca">🔍</span>

                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                  />
                </div>
              </section>

              {/* =====================================
                  RESULTADOS DA BUSCA
              ===================================== */}

              {busca.trim() !== "" && (
                <section className="secao-busca">
                  <div className="cabecalho-categoria">
                    <h2>Resultados para "{busca}"</h2>
                  </div>

                  {produtosFiltrados.length > 0 ? (
                    <div className="produtos-lista">
                      {renderizarProdutos(produtosFiltrados)}
                    </div>
                  ) : (
                    <p className="nenhum-produto">Nenhum produto encontrado.</p>
                  )}
                </section>
              )}

              {/* =====================================
                  CATEGORIAS
              ===================================== */}

              {busca.trim() === "" && (
                <>
                  <section className="categorias-home">
                    <h2 className="titulo-categorias">Busque sua categoria</h2>

                    <div className="lista-categorias">
                      {/* CAMISETAS */}

                      <a href="#camisetas" className="categoria-home">
                        <div className="icone-categoria">👕</div>

                        <span>Camisetas</span>
                      </a>

                      {/* MOLETONS */}

                      <a href="#moletons" className="categoria-home">
                        <div className="icone-categoria">🧥</div>

                        <span>Moletons</span>
                      </a>

                      {/* CALÇAS */}

                      <a href="#calcas" className="categoria-home">
                        <div className="icone-categoria">👖</div>

                        <span>Calças</span>
                      </a>

                      {/* TÊNIS */}

                      <a href="#tenis" className="categoria-home">
                        <div className="icone-categoria">👟</div>

                        <span>Tênis</span>
                      </a>
                    </div>
                  </section>

                  {/* =================================
                      CAMISETAS
                  ================================= */}

                  {camisetas.length > 0 && (
                    <section className="secao-categoria" id="camisetas">
                      <div className="cabecalho-categoria">
                        <h2>Camisetas</h2>

                        <a href="/produtos?categoria=8">Ver mais</a>
                      </div>

                      <div className="produtos-lista">
                        {renderizarProdutos(camisetas)}
                      </div>
                    </section>
                  )}

                  {/* =================================
                      MOLETONS
                  ================================= */}

                  {moletons.length > 0 && (
                    <section className="secao-categoria" id="moletons">
                      <div className="cabecalho-categoria">
                        <h2>Moletons</h2>

                        <a href="/produtos?categoria=6">Ver mais</a>
                      </div>

                      <div className="produtos-lista">
                        {renderizarProdutos(moletons)}
                      </div>
                    </section>
                  )}

                  {/* =================================
                      CALÇAS
                  ================================= */}

                  {calcas.length > 0 && (
                    <section className="secao-categoria" id="calcas">
                      <div className="cabecalho-categoria">
                        <h2>Calças</h2>

                        <a href="/produtos?categoria=7">Ver mais</a>
                      </div>

                      <div className="produtos-lista">
                        {renderizarProdutos(calcas)}
                      </div>
                    </section>
                  )}

                  {/* =================================
                      TÊNIS
                  ================================= */}

                  {tenis.length > 0 && (
                    <section className="secao-categoria" id="tenis">
                      <div className="cabecalho-categoria">
                        <h2>Tênis</h2>

                        <a href="/produtos?categoria=5">Ver mais</a>
                      </div>

                      <div className="produtos-lista">
                        {renderizarProdutos(tenis)}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* =====================================
                  FOOTER
              ===================================== */}

              <footer>
                <Footer />
              </footer>
            </>
          }
        />

        {/* =========================================g
            PEDIDOS
        ========================================= */}

        <Route path="/carrinho" element={<Carrinho />} />

        {/* =========================================
            PÁGINA INDIVIDUAL DO PRODUTO
        ========================================= */}

        <Route path="/produto/:id" element={<PaginaProduto />} />

        {/* =========================================
            PAINEL ADMIN
        ========================================= */}

        <Route path="/admin" element={<PainelAdmin />} />

        {/* =========================================
            PRODUTOS
        ========================================= */}

        <Route path="/produtos" element={<Produtos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
