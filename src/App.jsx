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

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section>
                <Carrossel />
              </section>

              <section className="produtos-lista">
                {produtos.map((produto) => (
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

                      <p className="preco-produto">R$ {produto.preco}</p>

                      <button className="botao-carrinho-produto">
                        Adicionar ao carrinho
                      </button>
                    </div>
                  </Link>
                ))}
              </section>

              <footer>
                <Footer />
              </footer>
            </>
          }
        />

        <Route path="/pedidos" element={<h1>Pedidos</h1>} />

        {/* PÁGINA INDIVIDUAL DO PRODUTO */}
        <Route path="/produto/:id" element={<PaginaProduto />} />

        {/* PAINEL ADMINISTRATIVO */}
        <Route path="/admin" element={<PainelAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
