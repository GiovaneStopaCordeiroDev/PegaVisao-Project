import { Carrinho } from "./pages/carrinho/carrinho";
import Footer from "./components/footer/footer";
import { Carrossel } from "./components/carrossel/carrossel";
import Header from "./components/header/header";
import { PainelAdmin } from "./components/painelAdmin/PainelAdmin";
import { Produtos } from "./pages/produtos/Produtos";
import { PaginaProduto } from "./pages/paginaProduto/paginaProduto";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* SONNER */}
      <Toaster position="top-right" richColors closeButton />

      {/* HEADER */}
      <Header />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <main className="home">
              <section className="secao-carrossel">
                <Carrossel />
              </section>
            </main>
          }
        />

        {/* CARRINHO */}
        <Route path="/carrinho" element={<Carrinho />} />

        {/* PÁGINA INDIVIDUAL DO PRODUTO */}
        <Route path="/produto/:id" element={<PaginaProduto />} />

        {/* PAINEL ADMIN */}
        <Route path="/admin" element={<PainelAdmin />} />

        {/* PRODUTOS */}
        <Route path="/produtos" element={<Produtos />} />

        {/* ROTA NÃO ENCONTRADA */}
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
