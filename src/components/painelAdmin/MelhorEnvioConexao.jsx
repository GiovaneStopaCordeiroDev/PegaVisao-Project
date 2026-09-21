import { useEffect, useState } from "react";
import api from "../../services/api";
import "./melhorEnvioConexao.css";

export function MelhorEnvioConexao() {
  const [status, setStatus] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/MelhorEnvio/status", { signal: controller.signal })
      .then(({ data }) => setStatus(data))
      .catch((error) => {
        if (!controller.signal.aborted) setMensagem(error.response?.data?.mensagem || "Integração de frete ainda indisponível.");
      });
    return () => controller.abort();
  }, []);

  async function atualizar() {
    setOcupado(true);
    setMensagem("");
    try {
      const { data } = await api.get("/api/MelhorEnvio/status");
      setStatus(data);
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || "Não foi possível consultar a integração.");
    } finally { setOcupado(false); }
  }

  async function conectar() {
    setOcupado(true);
    setMensagem("");
    try {
      const { data } = await api.post("/api/MelhorEnvio/autorizar");
      // Navegação pelo backend cria a correlação segura do navegador antes do OAuth.
      const url = new URL(data.url);
      const origemApi = new URL(api.defaults.baseURL).origin;
      if (url.origin !== origemApi || url.pathname !== "/api/MelhorEnvio/iniciar") {
        throw new Error("Endereço de autorização inesperado.");
      }
      window.location.assign(url.href);
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || "Não foi possível iniciar a autorização.");
      setOcupado(false);
    }
  }

  return (
    <section className="melhor-envio-conexao" aria-labelledby="titulo-melhor-envio">
      <h2 id="titulo-melhor-envio">Entrega · Melhor Envio</h2>
      <p>
        {status ? `${status.ambiente} — ${status.conectado
          ? status.tokenValido ? "Conta conectada" : "Conexão precisa ser verificada"
          : "Conta não conectada"}` : "Configure a conexão da loja para preparar as cotações de frete."}
      </p>
      <p>Cadastre peso e dimensões dos produtos para calcular as opções de entrega no checkout. A compra de etiquetas é feita separadamente no Melhor Envio.</p>
      {mensagem && <p role="alert">{mensagem}</p>}
      <div className="melhor-envio-acoes">
        <button type="button" disabled={ocupado} onClick={conectar}>
          {ocupado ? "Aguarde..." : status?.conectado ? "Reconectar conta" : "Conectar Melhor Envio"}
        </button>
        <button type="button" disabled={ocupado} onClick={atualizar}>Atualizar status</button>
      </div>
    </section>
  );
}
