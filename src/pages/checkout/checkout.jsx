import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./checkout.css";
import { FreteCheckout } from "./FreteCheckout";
import { freteValido, chaveCarrinho, lerJsonSeguro } from "../../services/freteCheckout";

export function Checkout() {
  const navigate = useNavigate();
  const [salvo] = useState(() => lerJsonSeguro("enderecoCheckout") || {});
  const [freteSelecionado, setFreteSelecionado] = useState(null);

  const [cep, setCep] = useState(salvo.cep || "");
  const [rua, setRua] = useState(salvo.rua || "");
  const [numero, setNumero] = useState(salvo.numero || "");
  const [complemento, setComplemento] = useState(salvo.complemento || "");
  const [bairro, setBairro] = useState(salvo.bairro || "");
  const [cidade, setCidade] = useState(salvo.cidade || "");
  const [estado, setEstado] = useState(salvo.estado || "");

  const [buscandoCep, setBuscandoCep] = useState(false);

  const [carrinho] = useState(() => {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
  });

  const subtotal = freteSelecionado?.subtotal ?? carrinho.reduce((total, item) => {
    return total + Number(item.preco) * Number(item.quantidade);
  }, 0);

  const opcaoFrete = freteValido(freteSelecionado, cep, carrinho)
    ? freteSelecionado.opcoes.find((opcao) => opcao.servicoId === freteSelecionado.servicoId) : null;
  const total = subtotal + (opcaoFrete?.valor ?? 0);

  function formatarCep(valor) {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 8);

    if (apenasNumeros.length > 5) {
      return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
    }

    return apenasNumeros;
  }

  async function buscarCep() {
    const cepNumerico = cep.replace(/\D/g, "");

    if (cepNumerico.length !== 8) {
      toast.error("Digite um CEP válido.");
      return;
    }

    try {
      setBuscandoCep(true);

      const response = await fetch(
        `https://viacep.com.br/ws/${cepNumerico}/json/`,
      );

      if (!response.ok) {
        throw new Error("Erro ao consultar CEP.");
      }

      const dados = await response.json();

      if (dados.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      setRua(dados.logradouro || "");
      setBairro(dados.bairro || "");
      setCidade(dados.localidade || "");
      setEstado(dados.uf || "");

      toast.success("Endereço encontrado!");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function continuarPagamento(event) {
    event.preventDefault();

    if (!freteValido(freteSelecionado, cep, carrinho)) {
      toast.error("Calcule o frete e selecione uma opção de entrega válida.");
      return;
    }
    if (chaveCarrinho(lerJsonSeguro("carrinho") || []) !== chaveCarrinho(carrinho)) {
      toast.error("Seu carrinho mudou. Atualize a página e recalcule o frete.");
      return;
    }

    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      toast.error("Informe um CEP válido.");
      return;
    }

    if (!rua.trim()) {
      toast.error("Informe a rua.");
      return;
    }

    if (!numero.trim()) {
      toast.error("Informe o número.");
      return;
    }

    if (!bairro.trim()) {
      toast.error("Informe o bairro.");
      return;
    }

    if (!cidade.trim()) {
      toast.error("Informe a cidade.");
      return;
    }

    if (!estado.trim()) {
      toast.error("Informe o estado.");
      return;
    }

    const endereco = {
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
    };

    localStorage.setItem("enderecoCheckout", JSON.stringify(endereco));
    localStorage.setItem("freteCheckout", JSON.stringify(freteSelecionado));

    navigate("/pagamento");
  }

  return (
    <main className="pagina-checkout">
      <div className="cabecalho-checkout">
        <h1>Finalizar compra</h1>

        <p>Informe o endereço onde deseja receber seu pedido.</p>
      </div>

      <div className="conteudo-checkout">
        <section className="formulario-endereco">
          <h2>Endereço de entrega</h2>

          <form onSubmit={continuarPagamento}>
            <div className="campo-checkout cep">
              <label htmlFor="cep">CEP</label>

              <div className="campo-cep">
                <input
                  id="cep"
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(event) => {
                    setCep(formatarCep(event.target.value));
                    setFreteSelecionado(null);
                  }}
                  onBlur={buscarCep}
                  maxLength={9}
                />

                <button
                  type="button"
                  onClick={buscarCep}
                  disabled={buscandoCep}
                >
                  {buscandoCep ? "Buscando..." : "Buscar CEP"}
                </button>
              </div>
            </div>

            <div className="campo-checkout">
              <label htmlFor="rua">Rua</label>

              <input
                id="rua"
                type="text"
                placeholder="Nome da rua"
                value={rua}
                onChange={(event) => setRua(event.target.value)}
              />
            </div>

            <div className="linha-checkout">
              <div className="campo-checkout">
                <label htmlFor="numero">Número</label>

                <input
                  id="numero"
                  type="text"
                  placeholder="Número"
                  value={numero}
                  onChange={(event) => setNumero(event.target.value)}
                />
              </div>

              <div className="campo-checkout">
                <label htmlFor="complemento">Complemento</label>

                <input
                  id="complemento"
                  type="text"
                  placeholder="Apartamento, casa..."
                  value={complemento}
                  onChange={(event) => setComplemento(event.target.value)}
                />
              </div>
            </div>

            <div className="campo-checkout">
              <label htmlFor="bairro">Bairro</label>

              <input
                id="bairro"
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(event) => setBairro(event.target.value)}
              />
            </div>

            <div className="linha-checkout">
              <div className="campo-checkout">
                <label htmlFor="cidade">Cidade</label>

                <input
                  id="cidade"
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(event) => setCidade(event.target.value)}
                />
              </div>

              <div className="campo-checkout estado">
                <label htmlFor="estado">Estado</label>

                <input
                  id="estado"
                  type="text"
                  placeholder="UF"
                  maxLength={2}
                  value={estado}
                  onChange={(event) =>
                    setEstado(event.target.value.toUpperCase())
                  }
                />
              </div>
            </div>

            <FreteCheckout key={`${cep.replace(/\D/g, "")}-${chaveCarrinho(carrinho)}`}
              cep={cep.replace(/\D/g, "")} itens={carrinho} onSelecionar={setFreteSelecionado} />

            <button type="submit" className="botao-continuar-checkout" disabled={!opcaoFrete}>
              Continuar para pagamento
            </button>
          </form>
        </section>

        <aside className="resumo-checkout">
          <h2>Resumo do pedido</h2>

          <div className="itens-resumo">
            {carrinho.map((item, index) => (
              <div className="item-resumo" key={`${item.variacaoId}-${index}`}>
                <img src={item.imagem} alt={item.nome} />

                <div>
                  <strong>{item.nome}</strong>

                  <span>
                    {item.cor} / {item.tamanho}
                  </span>

                  <span>Quantidade: {item.quantidade}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="linha-resumo-checkout">
            <span>Subtotal</span>

            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </div>

          {!freteSelecionado?.semFreteParaTeste && <div className="linha-resumo-checkout">
            <span>Frete</span>

            <span>{opcaoFrete ? `R$ ${opcaoFrete.valor.toFixed(2).replace(".", ",")}` : "A calcular"}</span>
          </div>}

          <hr />

          <div className="total-checkout">
            <span>Total</span>

            <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
