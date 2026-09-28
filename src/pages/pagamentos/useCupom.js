import { useEffect, useState } from "react";
import api from "../../services/api";
import { cupomSalvo, salvarCupom, itensCupom } from "../../services/cupons";

export function useCupom(carrinho, bloqueado) {
  const [codigo, setCodigo] = useState(cupomSalvo);
  const [texto, setTexto] = useState(cupomSalvo);
  const [revisao, setRevisao] = useState(0);
  const [validacao, setValidacao] = useState(null);
  const itens = JSON.stringify(itensCupom(carrinho));
  const chave = `${codigo}:${itens}:${revisao}`;
  const atual = validacao?.chave === chave ? validacao : null;
  const mensagem = error => error.response?.data?.mensagem || "Não foi possível validar o cupom. Tente novamente ou remova-o.";

  useEffect(() => {
    if (bloqueado || !codigo) return;
    const controller = new AbortController();
    api.post("/api/cupons/validar", { codigo, itens: JSON.parse(itens) }, { signal: controller.signal, timeout: 15000 })
      .then(({ data }) => { if (!controller.signal.aborted) setValidacao({ chave, data }); })
      .catch(error => { if (!controller.signal.aborted) setValidacao({ chave, erro: mensagem(error) }); });
    return () => controller.abort();
  }, [codigo, itens, chave, bloqueado]);

  function aplicar() {
    const normalizado = texto.trim().toUpperCase();
    if (!normalizado) return;
    setCodigo(normalizado); setTexto(normalizado); salvarCupom(normalizado); setRevisao(r => r + 1);
  }
  function remover() { setCodigo(""); setTexto(""); setValidacao(null); salvarCupom(""); }
  async function revalidar() {
    if (!codigo) return null;
    try {
      const { data } = await api.post("/api/cupons/validar", { codigo, itens: JSON.parse(itens) }, { timeout: 15000 });
      setValidacao({ chave, data });
      if (!atual?.data || data.desconto !== atual.data.desconto || data.subtotal !== atual.data.subtotal) {
        throw new Error("Os valores do cupom mudaram. Confira o novo total antes de confirmar novamente.");
      }
      return data;
    } catch (error) {
      if (error.response || error.code) setValidacao({ chave, erro: mensagem(error) });
      throw error;
    }
  }
  return { codigo, texto, setTexto, aplicar, remover, revalidar,
    dados: codigo ? atual?.data : null, erro: codigo ? atual?.erro : "",
    carregando: !bloqueado && !!codigo && !atual,
    impedido: !bloqueado && !!codigo && !atual?.data };
}
