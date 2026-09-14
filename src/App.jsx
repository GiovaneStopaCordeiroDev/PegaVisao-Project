
import api from "./services/api";
import { useState, useEffect } from "react";
import Footer from "./components/footer/footer";
import { Carrossel } from "./components/carrossel/carrossel";
import Header from "./components/header/header";
import { PainelAdmin } from "./components/painelAdmin/PainelAdmin";
import { PaginaProduto } from "./pages/paginaProduto/paginaProduto";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  const [produtos, setProdutos] = useState([]);

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

  // =========================
  // PRODUTOS POR CATEGORIA
  // =========================

  const tenis = produtos.filter(
    (produto) => produto.categoriaId === 5
  );

  const moletons = produtos.filter(
    (produto) => produto.categoriaId === 6
  );

  const calcas = produtos.filter(
    (produto) => produto.categoriaId === 7
  );

  const camisetas = produtos.filter(
    (produto) => produto.categoriaId === 8
  );

  // =========================
  // RENDERIZAR CARDS
  // =========================

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
          <h3 className="nome-produto">
            {produto.nome}
          </h3>

          <p className="descricao-produto">
            {produto.descricao}
          </p>

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

  return (
    <BrowserRouter>
      <Header />

      <Routes>

        {/* =================================
            HOME
        ================================= */}

        <Route
          path="/"
          element={
            <>
              {/* CARROSSEL */}

              <section>
                <Carrossel />
              </section>

              {/* =================================
                  CATEGORIAS
              ================================= */}

              <section className="categorias-home">
                <h2 className="titulo-categorias">
                  Compre por categoria
                </h2>

                <div className="lista-categorias">

                  <a
                    href="#camisetas"
                    className="categoria-home"
                  >
                    <div className="icone-categoria">
                      👕
                    </div>

                    <span>
                      Camisetas
                    </span>
                  </a>

                  <a
                    href="#moletons"
                    className="categoria-home"
                  >
                    <div className="icone-categoria">
                      🧥
                    </div>

                    <span>
                      Moletons
                    </span>
                  </a>

                  <a
                    href="#calcas"
                    className="categoria-home"
                  >
                    <div className="icone-categoria">
                      👖
                    </div>

                    <span>
                      Calças
                    </span>
                  </a>

                  <a
                    href="#tenis"
                    className="categoria-home"
                  >
                    <div className="icone-categoria">
                      👟
                    </div>

                    <span>
                      Tênis
                    </span>
                  </a>

                </div>
              </section>

              {/* =================================
                  CAMISETAS
              ================================= */}

              {camisetas.length > 0 && (
                <section
                  className="secao-categoria"
                  id="camisetas"
                >
                  <div className="cabecalho-categoria">
                    <h2>
                      Camisetas
                    </h2>

                    <a href="#camisetas">
                      Ver mais
                    </a>
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
                <section
                  className="secao-categoria"
                  id="moletons"
                >
                  <div className="cabecalho-categoria">
                    <h2>
                      Moletons
                    </h2>

                    <a href="#moletons">
                      Ver mais
                    </a>
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
                <section
                  className="secao-categoria"
                  id="calcas"
                >
                  <div className="cabecalho-categoria">
                    <h2>
                      Calças
                    </h2>

                    <a href="#calcas">
                      Ver mais
                    </a>
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
                <section
                  className="secao-categoria"
                  id="tenis"
                >
                  <div className="cabecalho-categoria">
                    <h2>
                      Tênis
                    </h2>

                    <a href="#tenis">
                      Ver mais
                    </a>
                  </div>

                  <div className="produtos-lista">
                    {renderizarProdutos(tenis)}
                  </div>
                </section>
              )}

              {/* FOOTER */}

              <footer>
                <Footer />
              </footer>
            </>
          }
        />

        {/* PEDIDOS */}

        <Route
          path="/pedidos"
          element={
            <h1>
              Pedidos
            </h1>
          }
        />

        {/* PÁGINA INDIVIDUAL */}

        <Route
          path="/produto/:id"
          element={
            <PaginaProduto />
          }
        />

        {/* PAINEL ADMIN */}

        <Route
          path="/admin"
          element={
            <PainelAdmin />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

