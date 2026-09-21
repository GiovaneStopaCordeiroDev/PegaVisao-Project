import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { chaveCarrinho } from "../../services/freteCheckout";

export function FreteCheckout({ cep, itens, onSelecionar }) {
  const [cotacao, setCotacao] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [expirou, setExpirou] = useState(false);
  const requisicao = useRef(null);

  useEffect(() => () => requisicao.current?.abort(), []);
  useEffect(() => {
    if (!cotacao) return;
    const timer = setTimeout(() => {
      setExpirou(true);
      onSelecionar(null);
    }, Math.max(0, new Date(cotacao.expiraEm).getTime() - Date.now()));
    return () => clearTimeout(timer);
  }, [cotacao, onSelecionar]);

  async function calcular() {
    requisicao.current?.abort();
    const controller = new AbortController();
    requisicao.current = controller;
    setCarregando(true);
    setErro("");
    setCotacao(null);
    setSelecionado(null);
    setExpirou(false);
    onSelecionar(null);
    try {
      const { data } = await api.post("/api/Frete/cotacoes", {
        cep,
        itens: itens.map((item) => ({ variacaoProdutoId: Number(item.variacaoId), quantidade: Number(item.quantidade) })),
      }, { signal: controller.signal, timeout: 45000 });
      if (!controller.signal.aborted) setCotacao(data);
    } catch (error) {
      if (controller.signal.aborted) return;
      setErro(error.response?.status === 401
        ? "Entre na sua conta para calcular o frete."
        : error.response?.data?.mensagem || "Não foi possível calcular o frete. Tente novamente.");
    } finally {
      if (!controller.signal.aborted) setCarregando(false);
    }
  }

  return (
    <section className="checkout-frete" aria-labelledby="titulo-frete">
      <h3 id="titulo-frete">Forma de entrega</h3>
      <button type="button" onClick={calcular} disabled={carregando || cep.length !== 8 || !itens.length}>
        {carregando ? "Consultando transportadoras..." : cotacao ? "Recalcular frete" : "Calcular frete"}
      </button>
      {erro && <p role="alert">{erro}</p>}
      {cotacao?.sandbox && <p className="frete-aviso">Cotação de teste (Sandbox). Esta opção não pode ser usada para uma cobrança real.</p>}
      {expirou && <p role="alert">Esta cotação venceu. Calcule o frete novamente.</p>}
      {cotacao && !expirou && (
        <fieldset className="frete-opcoes">
          <legend>Selecione a entrega</legend>
          {cotacao.opcoes.map((opcao) => (
            <label key={opcao.servicoId} className="frete-opcao">
              <input type="radio" name="servicoFrete" value={opcao.servicoId}
                checked={selecionado === opcao.servicoId}
                onChange={() => {
                  setSelecionado(opcao.servicoId);
                  onSelecionar({ ...cotacao, servicoId: opcao.servicoId, carrinhoChave: chaveCarrinho(itens) });
                }} />
              <span><strong>{opcao.transportadora} · {opcao.servico}</strong>
                <small>Prazo estimado: {opcao.prazoDias} dias úteis após postagem</small></span>
              <strong>{Number(opcao.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            </label>
          ))}
        </fieldset>
      )}
    </section>
  );
}
