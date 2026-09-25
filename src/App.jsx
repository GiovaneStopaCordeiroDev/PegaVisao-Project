import api from "./services/api";
import { useState, useEffect } from "react";
import { Carrinho } from "./pages/carrinho/carrinho";
import Footer from "./components/footer/footer";
import { Login } from "./pages/login/login";
import { RecuperarSenha } from "./pages/login/RecuperarSenha";
import { Cadastro } from "./pages/cadastro/cadastro";
import { Checkout } from "./pages/checkout/checkout";
import { Pedidos } from "./pages/pedidos/pedidos";
import { Pagamento } from "./pages/pagamentos/pagamentos";
import { PagamentoConcluido } from "./pages/pagamentos/PagamentoConcluido";
import { ProtectedRoute } from "./components/protectedroute/protectedroute";
import { Carrossel } from "./components/carrossel/carrossel";
import Header from "./components/header/header";
import { PainelAdmin } from "./components/painelAdmin/PainelAdmin";
import { Produtos } from "./pages/produtos/Produtos";
import { PaginaProduto } from "./pages/paginaProduto/paginaProduto";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { Toaster } from "sonner";
import { textoParcelamento } from "./services/parcelamento";
import "./App.css";

function App() {
  const [produtos,setProdutos]=useState([]);
  useEffect(()=>{ api.get("/Produto").then(r=>setProdutos(r.data)).catch(e=>console.error("ERRO:",e)); },[]);
  const tenis=produtos.filter(p=>p.categoriaId===5), moletons=produtos.filter(p=>p.categoriaId===6), calcas=produtos.filter(p=>p.categoriaId===7), camisetas=produtos.filter(p=>p.categoriaId===8);
  function renderizarProdutos(lista){return lista.map(produto=>{const parcelas=textoParcelamento(produto.preco);return <article className="card-produto" key={produto.id}><Link to={`/produto/${produto.id}`} className="link-card-produto"><div className="imagem-card-container"><img src={produto.imagemPrincipal} alt={produto.nome} className="imagem-produto"/></div><div className="info-produto"><h3 className="nome-produto">{produto.nome}</h3><p className="descricao-produto">{produto.descricao}</p><p className="preco-produto">R$ {Number(produto.preco).toFixed(2).replace(".",",")}</p>{parcelas&&<p className="parcelamento-produto">{parcelas}</p>}</div></Link><div className="area-botao-card"><Link to={`/produto/${produto.id}`} className="botao-carrinho-produto">Adicionar ao carrinho</Link></div></article>})}
  return <BrowserRouter><Toaster position="top-right" richColors closeButton/><Header/><a href="https://wa.me/5514991851217" target="_blank" rel="noopener noreferrer" className="botao-whatsapp" aria-label="Fale conosco pelo WhatsApp"><FaWhatsapp/></a><Routes>
    <Route path="/login" element={<Login/>}/><Route path="/esqueci-senha" element={<RecuperarSenha key="solicitar"/>}/><Route path="/redefinir-senha" element={<RecuperarSenha key="redefinir" redefinir/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/pagamento" element={<Pagamento/>}/><Route path="/pagamento-concluido" element={<PagamentoConcluido/>}/><Route path="/pedidos" element={<Pedidos/>}/><Route path="/cadastro" element={<Cadastro/>}/>
    <Route path="/" element={<main className="home"><section className="secao-carrossel"><Carrossel/></section>{[[camisetas,"Camisetas",8],[moletons,"Moletons",6],[calcas,"Calças",7],[tenis,"Tênis",5]].map(([lista,nome,id])=>lista.length>0&&<section className="secao-categoria" key={id}><div className="cabecalho-categoria"><h2>{nome}</h2><Link to={`/produtos?categoria=${id}`}>Ver mais</Link></div><div className="produtos-lista">{renderizarProdutos(lista)}</div></section>)}</main>}/>
    <Route path="/carrinho" element={<Carrinho/>}/><Route path="/produto/:id" element={<PaginaProduto/>}/><Route path="/admin" element={<ProtectedRoute adminOnly={true}><PainelAdmin/></ProtectedRoute>}/><Route path="/produtos" element={<Produtos/>}/><Route path="*" element={<main className="rota-nao-encontrada"><h1>404</h1><p>Página não encontrada.</p></main>}/>
  </Routes><Footer/></BrowserRouter>;
}
export default App;