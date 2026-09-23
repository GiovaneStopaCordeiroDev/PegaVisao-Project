import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../services/api";
import "./avaliacoesProduto.css";

export function AvaliacoesProduto({ produtoId }) {
  const [resumo, setResumo] = useState(null);
  const [minha, setMinha] = useState(null);
  const [nota, setNota] = useState(0);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const logado = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const [publica, pessoal] = await Promise.all([
          api.get(`/Produto/${produtoId}/avaliacoes`, { signal: controller.signal }),
          logado ? api.get(`/Produto/${produtoId}/avaliacoes/minha`, { signal: controller.signal }) : null,
        ]);
        if (controller.signal.aborted) return;
        setErro("");
        setResumo(publica.data);
        setMinha(pessoal?.data ?? null);
        setNota(pessoal?.data.nota ?? 0);
      } catch {
        if (!controller.signal.aborted) setErro("Não foi possível carregar as avaliações.");
      }
    }
    carregar();
    return () => controller.abort();
  }, [produtoId, logado, tentativa]);

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");
    try {
      await api.put(`/Produto/${produtoId}/avaliacoes/minha`, { nota });
      setMinha((atual) => ({ ...atual, nota }));
      setMensagem("Avaliação salva. Obrigado por avaliar este produto!");
      setTentativa((valor) => valor + 1);
    } catch (error) {
      setErro(error.response?.data?.mensagem ?? "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return <section className="avaliacoes-produto" id="avaliacoes" aria-labelledby="titulo-avaliacoes">
    <h2 id="titulo-avaliacoes">Avaliações do produto</h2>
    {resumo ? <p>{resumo.total > 0
      ? `★ ${resumo.media.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5 · ${resumo.total} avaliação(ões) de compradores`
      : "Este produto ainda não recebeu avaliações."}</p> : !erro && <p role="status">Carregando avaliações...</p>}
    {!logado && <p><Link to="/login" state={{ redirectTo: `/produto/${produtoId}` }}>Entre na sua conta</Link> para avaliar um produto que você comprou.</p>}
    {minha && !minha.podeAvaliar && <p>A avaliação fica disponível para quem comprou este produto após a confirmação do pagamento.</p>}
    {minha?.podeAvaliar && <form onSubmit={salvar}>
      <fieldset disabled={salvando}>
        <legend>{minha.nota ? "Atualize sua avaliação" : "Como você avalia este produto?"}</legend>
        <div className="avaliacao-estrelas">
          {[1, 2, 3, 4, 5].map((valor) => <label key={valor}>
            <input type="radio" name={`nota-${produtoId}`} value={valor} checked={nota === valor}
              onChange={() => setNota(valor)} aria-label={`${valor} estrela${valor > 1 ? "s" : ""}`} />
            <Star aria-hidden="true" size={32} fill={valor <= nota ? "currentColor" : "none"} />
          </label>)}
        </div>
        <p>{nota ? `${nota} de 5 estrelas` : "Selecione de 1 a 5 estrelas."}</p>
        <button type="submit" disabled={!nota || salvando}>{salvando ? "Salvando..." : "Salvar avaliação"}</button>
      </fieldset>
    </form>}
    {mensagem && <p role="status">{mensagem}</p>}
    {erro && <div role="alert"><p>{erro}</p>{!resumo && <button type="button" onClick={() => { setErro(""); setTentativa((valor) => valor + 1); }}>Tentar novamente</button>}</div>}
  </section>;
}
