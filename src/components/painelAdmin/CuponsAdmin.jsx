import { useEffect, useState } from "react";
import api from "../../services/api";
import { dataBrasiliaInput, dataBrasiliaUtc, moedaCupom } from "../../services/cupons";
import "./cuponsAdmin.css";

const novoCupom = () => ({ codigo: "", descricao: "", tipo: "Percentual", valor: "", valorMinimo: 0,
  descontoMaximo: "", inicioEm: dataBrasiliaInput(new Date()),
  validadeEm: dataBrasiliaInput(new Date(Date.now() + 30 * 86400000)), ativo: true,
  limiteTotal: "", limitePorUsuario: "", todosProdutos: true, produtoIds: [] });
const mensagemErro = error => error.response?.data?.mensagem ||
  Object.values(error.response?.data?.errors || {}).flat().join(" ") || "Não foi possível concluir. Tente novamente.";
const data = valor => new Date(valor).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
function situacao(c) {
  if (!c.ativo) return "Inativo";
  if (Date.parse(c.validadeEm) <= Date.now()) return "Vencido";
  if (Date.parse(c.inicioEm) > Date.now()) return "Agendado";
  return "Ativo";
}

export function CuponsAdmin() {
  const [cupons, setCupons] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [revisao, setRevisao] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([api.get("/api/cupons", { signal: controller.signal }), api.get("/Produto", { signal: controller.signal })])
      .then(([lista, catalogo]) => { setCupons(lista.data); setProdutos(catalogo.data); })
      .catch(error => { if (!controller.signal.aborted) setErro(mensagemErro(error)); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [revisao]);

  const alterar = (campo, valor) => setForm(atual => ({ ...atual, [campo]: valor }));
  function editar(c) {
    setErro(""); setAviso(""); setBusca("");
    setForm({ ...c, inicioEm: dataBrasiliaInput(c.inicioEm), validadeEm: dataBrasiliaInput(c.validadeEm),
      descontoMaximo: c.descontoMaximo ?? "", limiteTotal: c.limiteTotal ?? "", limitePorUsuario: c.limitePorUsuario ?? "" });
  }
  async function executar(acao, sucesso) {
    setSalvando(true); setErro(""); setAviso("");
    try { await acao(); setForm(null); setAviso(sucesso); setRevisao(r => r + 1); }
    catch (error) { setErro(mensagemErro(error)); }
    finally { setSalvando(false); }
  }
  function salvar(event) {
    event.preventDefault();
    if (!form.todosProdutos && !form.produtoIds.length) { setErro("Selecione pelo menos um produto."); return; }
    const payload = { ...form, codigo: form.codigo.trim().toUpperCase(), valor: Number(form.valor),
      valorMinimo: Number(form.valorMinimo), descontoMaximo: form.descontoMaximo === "" ? null : Number(form.descontoMaximo),
      limiteTotal: form.limiteTotal === "" ? null : Number(form.limiteTotal),
      limitePorUsuario: form.limitePorUsuario === "" ? null : Number(form.limitePorUsuario),
      inicioEm: dataBrasiliaUtc(form.inicioEm), validadeEm: dataBrasiliaUtc(form.validadeEm),
      produtoIds: form.todosProdutos ? [] : form.produtoIds };
    if (payload.validadeEm <= payload.inicioEm) { setErro("O vencimento deve ser posterior ao início."); return; }
    executar(() => form.id ? api.put(`/api/cupons/${form.id}`, payload) : api.post("/api/cupons", payload), "Cupom salvo.");
  }
  const catalogo = produtos.filter(p => p.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")));
  return <section className="cupons-admin">
    <div className="cupons-cabecalho"><div><h1>Cupons</h1><p>Crie descontos para toda a loja ou produtos selecionados.</p></div>
      <button type="button" disabled={salvando || carregando} onClick={() => { setForm(novoCupom()); setBusca(""); setErro(""); setAviso(""); }}>Criar cupom</button></div>
    {erro && <p role="alert" className="cupons-mensagem">{erro}</p>}
    {aviso && <p role="status" className="cupons-mensagem">{aviso}</p>}
    {carregando && <p role="status">Carregando cupons…</p>}
    {!carregando && erro && !form && <button type="button" onClick={() => { setErro(""); setRevisao(r => r + 1); }}>Atualizar lista</button>}
    {form && <form className="cupom-form" onSubmit={salvar}>
      <h2>{form.id ? "Editar cupom" : "Novo cupom"}</h2>
      <fieldset disabled={salvando}>
        <div className="cupom-campos">
          <label>Código<input required pattern="[A-Za-z0-9_-]{3,40}" maxLength={40} value={form.codigo} onChange={e => alterar("codigo", e.target.value.toUpperCase())} placeholder="PEGA10" /></label>
          <label>Descrição<input maxLength={300} value={form.descricao} onChange={e => alterar("descricao", e.target.value)} /></label>
          <label>Tipo de desconto<select value={form.tipo} onChange={e => alterar("tipo", e.target.value)}><option value="Percentual">Percentual (%)</option><option value="Fixo">Valor fixo (R$)</option></select></label>
          <label>Desconto ({form.tipo === "Percentual" ? "%" : "R$"})<input required type="number" min="0.01" max={form.tipo === "Percentual" ? 100 : 99999999} step="0.01" value={form.valor} onChange={e => alterar("valor", e.target.value)} /></label>
          <label>Compra mínima dos produtos participantes (R$)<input required type="number" min="0" step="0.01" value={form.valorMinimo} onChange={e => alterar("valorMinimo", e.target.value)} /></label>
          <label>Teto de desconto (R$, opcional)<input type="number" min="0.01" step="0.01" value={form.descontoMaximo} onChange={e => alterar("descontoMaximo", e.target.value)} /></label>
          <label>Início (Brasília)<input required type="datetime-local" value={form.inicioEm} onChange={e => alterar("inicioEm", e.target.value)} /></label>
          <label>Vencimento (Brasília)<input required type="datetime-local" value={form.validadeEm} onChange={e => alterar("validadeEm", e.target.value)} /></label>
          <label>Limite total (opcional)<input type="number" min="1" step="1" value={form.limiteTotal} onChange={e => alterar("limiteTotal", e.target.value)} /></label>
          <label>Limite por cliente (opcional)<input type="number" min="1" step="1" value={form.limitePorUsuario} onChange={e => alterar("limitePorUsuario", e.target.value)} /></label>
          <label>Aplicar a<select value={form.todosProdutos ? "todos" : "selecionados"} onChange={e => alterar("todosProdutos", e.target.value === "todos")}><option value="todos">Todos os produtos</option><option value="selecionados">Produtos selecionados</option></select></label>
          <label className="cupom-checkbox"><input type="checkbox" checked={form.ativo} onChange={e => alterar("ativo", e.target.checked)} />Cupom ativo</label>
        </div>
        {!form.todosProdutos && <div className="cupom-selecao">
          <label>Buscar produtos<input type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome do produto" /></label>
          <p>{form.produtoIds.length} selecionado(s). Todas as cores e tamanhos participam.</p>
          <div className="cupom-produtos">{catalogo.map(p => <label key={p.id} className="cupom-checkbox"><input type="checkbox" checked={form.produtoIds.includes(p.id)} onChange={e => alterar("produtoIds", e.target.checked ? [...form.produtoIds, p.id] : form.produtoIds.filter(id => id !== p.id))} /><span>{p.nome} · {moedaCupom(p.preco)}</span></label>)}
            {!catalogo.length && <p>Nenhum produto encontrado.</p>}</div>
        </div>}
        <p className="cupom-ajuda">O desconto não inclui frete. Deixe os limites em branco para não limitar. Pedidos pendentes reservam uma utilização.</p>
        <div className="cupom-acoes"><button type="submit">{salvando ? "Salvando…" : "Salvar cupom"}</button><button type="button" className="cupom-secundario" onClick={() => setForm(null)}>Cancelar</button></div>
      </fieldset>
    </form>}
    {!carregando && !cupons.length && !erro && <p>Nenhum cupom cadastrado.</p>}
    <div className="cupons-lista">{cupons.map(({ cupom: c, usos, pagos }) => <article key={c.id} className="cupom-card">
      <div className="cupons-cabecalho"><h2>{c.codigo}</h2><span>{situacao(c)}</span></div>
      <strong>{c.tipo === "Percentual" ? `${c.valor}%` : moedaCupom(c.valor)} de desconto</strong>
      {c.descricao && <p>{c.descricao}</p>}
      <p>{c.todosProdutos ? "Todos os produtos" : `${c.produtoIds.length} produto(s) selecionado(s)`}</p>
      <p>De {data(c.inicioEm)} até {data(c.validadeEm)} (Brasília)</p>
      <p>{usos} utilização(ões){c.limiteTotal ? ` de ${c.limiteTotal}` : ""} · {pagos} paga(s)</p>
      <div className="cupom-acoes"><button type="button" disabled={salvando} onClick={() => editar(c)}>Editar</button>
        <button type="button" className="cupom-secundario" disabled={salvando} onClick={() => executar(() => api.put(`/api/cupons/${c.id}`, { ...c, ativo: !c.ativo }), c.ativo ? "Cupom desativado." : "Cupom ativado.")}>{c.ativo ? "Desativar" : "Ativar"}</button>
        <button type="button" className="cupom-secundario" disabled={salvando} onClick={() => { if (window.confirm(`Excluir o cupom ${c.codigo}? Os pedidos anteriores serão preservados.`)) executar(() => api.delete(`/api/cupons/${c.id}`), "Cupom excluído."); }}>Excluir</button></div>
    </article>)}</div>
  </section>;
}
