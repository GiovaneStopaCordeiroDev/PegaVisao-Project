import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./checkout.css";

export function Checkout() {
  const navigate = useNavigate();

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [buscandoCep, setBuscandoCep] = useState(false);

  const [carrinho] = useState(() => {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
  });

  const subtotal = carrinho.reduce((total, item) => {
    return total + Number(item.preco) * Number(item.quantidade);
  }, 0);

  const total = subtotal;

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
                  onChange={(event) => setCep(formatarCep(event.target.value))}
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

            <button type="submit" className="botao-continuar-checkout">
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

          <div className="linha-resumo-checkout">
            <span>Frete</span>

            <span>R$ 0,00</span>
          </div>

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
