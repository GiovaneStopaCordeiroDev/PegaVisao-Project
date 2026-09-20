import api from "./services/api";

import { useState, useEffect } from "react";

import { Carrinho } from "./pages/carrinho/carrinho";

import Footer from "./components/footer/footer";

import { Login } from "./pages/login/login";

import { Cadastro } from "./pages/cadastro/cadastro";

import { Checkout } from "./pages/checkout/checkout";

import { Pedidos } from "./pages/pedidos/pedidos";

import { Pagamento } from "./pages/pagamentos/pagamentos";

import { ProtectedRoute } from "./components/protectedroute/protectedroute";

import { Carrossel } from "./components/carrossel/carrossel";

import Header from "./components/header/header";

import { PainelAdmin } from "./components/painelAdmin/PainelAdmin";

import { Produtos } from "./pages/produtos/Produtos";

import { PaginaProduto } from "./pages/paginaProduto/paginaProduto";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { FaWhatsapp } from "react-icons/fa";

import { Toaster } from "sonner";

import "./App.css";

function App() {
  const [produtos, setProdutos] = useState([]);

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
      <article className="card-produto" key={produto.id}>
        <Link to={`/produto/${produto.id}`} className="link-card-produto">
          <div className="imagem-card-container">
            <img
              src={produto.imagemPrincipal}
              alt={produto.nome}
              className="imagem-produto"
            />
          </div>

          <div className="info-produto">
            <h3 className="nome-produto">{produto.nome}</h3>

            <p className="descricao-produto">{produto.descricao}</p>

            <p className="preco-produto">
              R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </Link>

        <div className="area-botao-card">
          <Link
            to={`/produto/${produto.id}`}
            className="botao-carrinho-produto"
          >
            Adicionar ao carrinho
          </Link>
        </div>
      </article>
    ));
  }

  // =========================================
  // INTERFACE
  // =========================================

  return (
    <BrowserRouter>
      {/* SONNER */}

      <Toaster position="top-right" richColors closeButton />

      {/* HEADER */}

      <Header />

      <a
        href="https://wa.me/5514991851217"
        target="_blank"
        rel="noopener noreferrer"
        className="botao-whatsapp"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <Routes>  

        {/* =========================================
                    LOGIN
                ========================================= */}

        <Route path="/login" element={<Login />} />

        {/* =========================================
                    CHECKOUT
                ========================================= */}

        <Route path="/checkout" element={<Checkout />} />

        {/* =========================================
                    PAGAMENTOS
                ========================================= */}

        <Route path="/pagamento" element={<Pagamento />} />

       {/* =========================================
                    PAGAMENTOS
                ========================================= */}

        <Route path="/pedidos" element={<Pedidos />} />

        {/* =========================================
                    CADASTRO
                ========================================= */}
        <Route path="/cadastro" element={<Cadastro />} />



        {/* =========================================
                    HOME
                ========================================= */}

        <Route
          path="/"
          element={
            <main className="home">
              {/* CARROSSEL */}

              <section className="secao-carrossel">
                <Carrossel />
              </section>

              {/* =================================
                                CAMISETAS
                            ================================= */}

              {camisetas.length > 0 && (
                <section className="secao-categoria">
                  <div className="cabecalho-categoria">
                    <h2>Camisetas</h2>

                    <Link to="/produtos?categoria=8">Ver mais</Link>
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
                <section className="secao-categoria">
                  <div className="cabecalho-categoria">
                    <h2>Moletons</h2>

                    <Link to="/produtos?categoria=6">Ver mais</Link>
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
                <section className="secao-categoria">
                  <div className="cabecalho-categoria">
                    <h2>Calças</h2>

                    <Link to="/produtos?categoria=7">Ver mais</Link>
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
                <section className="secao-categoria">
                  <div className="cabecalho-categoria">
                    <h2>Tênis</h2>

                    <Link to="/produtos?categoria=5">Ver mais</Link>
                  </div>

                  <div className="produtos-lista">
                    {renderizarProdutos(tenis)}
                  </div>
                </section>
              )}
            </main>
          }
        />

        {/* =========================================
                    CARRINHO
                ========================================= */}

        <Route path="/carrinho" element={<Carrinho />} />

        {/* =========================================
                    PÁGINA DO PRODUTO
                ========================================= */}

        <Route path="/produto/:id" element={<PaginaProduto />} />

        {/* =========================================
                    PAINEL ADMIN
                ========================================= */}

        <Route
            path="/admin"
            element={
                <ProtectedRoute adminOnly={true}>
                    <PainelAdmin />
                </ProtectedRoute>
            }
        />

        {/* =========================================
                    PRODUTOS
                ========================================= */}

        <Route path="/produtos" element={<Produtos />} />

        {/* =========================================
                    ROTA NÃO ENCONTRADA
                ========================================= */}

        <Route
          path="*"
          element={
            <main className="rota-nao-encontrada">
              <h1>404</h1>
              <p>Página não encontrada.</p>
            </main>
          }
        />
      </Routes>

      {/* FOOTER */}

      <Footer />
    </BrowserRouter>
  );
}

export default App;
