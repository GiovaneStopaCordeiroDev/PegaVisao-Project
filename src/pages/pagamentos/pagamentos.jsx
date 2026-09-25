import { ContadorPagamento } from "../../components/ContadorPagamento";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import api from "../../services/api";
import { registrarPixPendente, concluirPixPendente } from "../../services/pixPendente";
import { freteValido, chaveCarrinho, lerJsonSeguro } from "../../services/freteCheckout";

import "./pagamentos.css";

export function Pagamento() {
  const navigate = useNavigate();

  const [formaPagamento, setFormaPagamento] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  // Guarda os dados do Pix depois que o pedido é criado
  const [pixData, setPixData] = useState(null);
  const [prazoVencido, setPrazoVencido] = useState(false);
  const [freteSalvo] = useState(() => lerJsonSeguro("freteCheckout"));
  const [cotacao, setCotacao] = useState(null);
  const [pedidoCriado, setPedidoCriado] = useState(null);

  useEffect(() => {
    if (!pixData?.pedidoId) return;
    let ativo = true;
    let timer;
    const controller = new AbortController();
    async function consultar() {
      try {
        const { data } = await api.get(`/Pedido/${pixData.pedidoId}`, {
          signal: controller.signal,
          timeout: 10000,
        });
        if (!ativo) return;
        if (data.status === "Pago") {
          concluirPixPendente(data);
          toast.success("Pagamento confirmado!");
          navigate("/pedidos", { replace: true });
          return;
        }
        if (data.status === "Cancelado") {
          setPrazoVencido(true);
          navigate("/pedidos", { replace: true });
          toast.error("Este pedido foi cancelado. Consulte seus pedidos.");
          return;
        }
      } catch (error) {
        if (!ativo) return;
        if (error.response?.status === 401 || error.response?.status === 404) {
          toast.error("Não foi possível consultar o pedido. Acesse Meus pedidos após entrar novamente.");
          return;
        }
      }
      if (ativo) timer = setTimeout(consultar, 5000);
    }
    consultar();
    return () => {
      ativo = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [pixData?.pedidoId, navigate]);

  const [carrinho] = useState(() => {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
  });

  const [endereco] = useState(() => {
    return JSON.parse(localStorage.getItem("enderecoCheckout")) || null;
  });

  const subtotal = pedidoCriado?.subtotalProdutos ?? cotacao?.subtotal ?? carrinho.reduce((total, item) => {
    return total + Number(item.preco) * Number(item.quantidade);
  }, 0);

  const opcaoFrete = cotacao?.opcoes.find((opcao) => opcao.servicoId === freteSalvo?.servicoId);
  const frete = pedidoCriado?.valorFrete ?? opcaoFrete?.valor ?? 0;
  const total = subtotal + frete;

  useEffect(() => {
    if (!endereco || !carrinho.length) return;
    if (!freteValido(freteSalvo, endereco.cep, carrinho)) {
      toast.error("Calcule o frete novamente antes de continuar.");
      navigate("/checkout", { replace: true });
      return;
    }
    const controller = new AbortController();
    api.get(`/api/Frete/cotacoes/${freteSalvo.id}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!freteValido({ ...data, servicoId: freteSalvo.servicoId, carrinhoChave: freteSalvo.carrinhoChave }, endereco.cep, carrinho)) {
          throw new Error("Cotação inválida");
        }
        setCotacao(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        toast.error(error.response?.data?.mensagem || "Não foi possível validar o frete. Calcule novamente.");
        navigate("/checkout", { replace: true });
      });
    return () => controller.abort();
  }, [freteSalvo, endereco, carrinho, navigate]);

  useEffect(() => {
    if (!endereco) {
      toast.error("Endereço de entrega não encontrado.");
      navigate("/checkout");
      return;
    }

    if (carrinho.length === 0) {
      toast.error("Seu carrinho está vazio.");
      navigate("/carrinho");
    }
  }, [endereco, carrinho.length, navigate]);

  async function continuarPagamento() {
    if (pedidoCriado) {
      navigate("/pedidos");
      return;
    }
    if (!opcaoFrete || !freteValido(freteSalvo, endereco?.cep, carrinho) ||
        chaveCarrinho(lerJsonSeguro("carrinho") || []) !== chaveCarrinho(carrinho)) {
      toast.error("Sua cotação venceu ou o carrinho mudou. Calcule o frete novamente.");
      navigate("/checkout");
      return;
    }
    if (!formaPagamento) {
      toast.error("Selecione uma forma de pagamento.");
      return;
    }

    if (!endereco) {
      toast.error("Endereço de entrega não encontrado.");
      navigate("/checkout");
      return;
    }

    if (carrinho.length === 0) {
      toast.error("Seu carrinho está vazio.");
      navigate("/carrinho");
      return;
    }

    try {
      setFinalizando(true);

      const pedido = {
        itens: carrinho.map((item) => ({
          variacaoProdutoId: Number(item.variacaoId),
          quantidade: Number(item.quantidade),
        })),

        cpfDestinatario: endereco.cpf?.replace(/\D/g, "") || null,
        telefoneDestinatario: endereco.telefone?.replace(/\D/g, "") || null,
        cep: endereco.cep,
        rua: endereco.rua,
        numero: endereco.numero,
        complemento: endereco.complemento || null,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,

        formaPagamento: formaPagamento === "pix" ? "Pix" : "Cartão",
        cotacaoFreteId: cotacao.id,
        freteServicoId: opcaoFrete.servicoId,
      };

      console.log("Payload enviado:", pedido);

      const response = await api.post("/Pedido", pedido);
      setPedidoCriado(response.data);

      console.log("Pedido criado:", response.data);

      // ==========================================
      // PIX
      // ==========================================

      if (formaPagamento === "pix") {
        const qrCode = response.data.pixQrCode;
        const qrCodeBase64 = response.data.pixQrCodeBase64;

        if (!qrCode) {
          toast.error("O pedido foi criado, mas o código Pix não foi gerado.");
          return;
        }

        // Guarda os dados do Pix na tela
        setPixData({
          qrCode,
          qrCodeBase64,
          paymentId: response.data.mercadoPagoPaymentId,
          pedidoId: response.data.id,
        });

        registrarPixPendente(response.data.id);

        toast.success("Pix gerado com sucesso!");

        return;
      }

      // ==========================================
      // CARTÃO
      // ==========================================

      const checkoutUrl = response.data.mercadoPagoCheckoutUrl;

      if (!checkoutUrl) {
        toast.error(
          "O pedido foi criado, mas o checkout do Mercado Pago não foi gerado.",
        );
        return;
      }

      // Só limpa o carrinho quando temos
      // certeza de que o checkout foi criado
      localStorage.removeItem("carrinho");
      localStorage.removeItem("enderecoCheckout");
      localStorage.removeItem("formaPagamento");
      localStorage.removeItem("freteCheckout");

      // Redireciona para o Mercado Pago
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      if (error.response?.data?.pedidoId) {
        setPedidoCriado({ id: error.response.data.pedidoId });
      }

      if (error.response?.status === 401) {
        toast.error("Sua sessão expirou. Faça login novamente.");

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        navigate("/login", {
          state: {
            redirectTo: "/checkout",
          },
        });

        return;
      }

      const mensagem =
        error.response?.data?.mensagem ||
        error.response?.data?.erro ||
        error.response?.data ||
        "Não foi possível realizar o pedido.";

      toast.error(
        typeof mensagem === "string"
          ? mensagem
          : "Não foi possível realizar o pedido.",
      );
    } finally {
      setFinalizando(false);
    }
  }

  async function copiarPix() {
    if (!pixData?.qrCode || prazoVencido) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pixData.qrCode);

      toast.success("Código Pix copiado!");
    } catch (error) {
      console.error("Erro ao copiar código Pix:", error);

      toast.error("Não foi possível copiar o código Pix.");
    }
  }

  function voltarCheckout() {
    if (pixData) {
      toast.error(
        "Finalize ou copie o código Pix antes de alterar o endereço.",
      );

      return;
    }

    navigate("/checkout");
  }

  if (!endereco) {
    return null;
  }

  return (
    <main className="pagina-pagamento">
      {/* ==========================================
          CABEÇALHO
      ========================================== */}

      <div className="cabecalho-pagamento">
        <h1>Pagamento</h1>

        <p>
          {pixData
            ? "Escaneie o QR Code ou copie o código Pix para pagar."
            : "Escolha como deseja pagar seu pedido."}
        </p>
      </div>

      <div className="conteudo-pagamento">
        <section className="area-pagamento">
          {/* ==========================================
              PIX GERADO
          ========================================== */}

          {pixData ? (
            <div className="bloco-pagamento pix-gerado">
              <h2>Pagamento via Pix</h2>

              <ContadorPagamento expiraEm={pedidoCriado?.pagamentoExpiraEm}
                servidorAgora={pedidoCriado?.servidorAgora} onVencer={() => setPrazoVencido(true)} />
              {!prazoVencido && <p>Escaneie o QR Code abaixo usando o aplicativo do seu banco.</p>}
              {!prazoVencido && <>

              {pixData.qrCodeBase64 ? (
                <div className="qr-code-container">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code Pix"
                    className="qr-code-pix"
                  />
                </div>
              ) : (
                <p>QR Code visual não disponível.</p>
              )}

              <div className="pix-codigo">
                <strong>Código Pix</strong>

                <div className="pix-codigo-box">
                  <span>{pixData.qrCode}</span>
                </div>

                <button
                  type="button"
                  className="botao-copiar-pix"
                  onClick={copiarPix}
                >
                  Copiar código Pix
                </button>
              </div>

              </>}

              <div className="pix-informacoes">
                <strong>Pedido #{pixData.pedidoId}</strong>

                <span>Após realizar o pagamento, aguarde a confirmação.</span>
              </div>
            </div>
          ) : (
            <>
              {/* ==========================================
                  FORMA DE PAGAMENTO
              ========================================== */}

              <div className="bloco-pagamento">
                <h2>Forma de pagamento</h2>
                <p>Após gerar o pagamento, você terá 15 minutos para pagar.</p>

                <div className="opcoes-pagamento">
                  {/* PIX */}

                  <button
                    type="button"
                    className={`opcao-pagamento ${
                      formaPagamento === "pix" ? "selecionado" : ""
                    }`}
                    onClick={() => setFormaPagamento("pix")}
                    disabled={finalizando}
                  >
                    <div className="icone-pagamento">PIX</div>

                    <div className="texto-opcao">
                      <strong>Pix</strong>

                      <span>Pagamento instantâneo</span>
                    </div>

                    <div className="radio-pagamento">
                      <span />
                    </div>
                  </button>

                  {/* CARTÃO */}

                  <button
                    type="button"
                    className={`opcao-pagamento ${
                      formaPagamento === "cartao" ? "selecionado" : ""
                    }`}
                    onClick={() => setFormaPagamento("cartao")}
                    disabled={finalizando}
                  >
                    <div className="icone-pagamento">💳</div>

                    <div className="texto-opcao">
                      <strong>Cartão</strong>

                      <span>Crédito ou débito</span>
                    </div>

                    <div className="radio-pagamento">
                      <span />
                    </div>
                  </button>
                </div>
              </div>

              {/* ==========================================
                  ENDEREÇO
              ========================================== */}

              <div className="bloco-pagamento">
                <div className="titulo-endereco-pagamento">
                  <h2>Endereço de entrega</h2>

                  <button
                    type="button"
                    onClick={voltarCheckout}
                    disabled={finalizando}
                  >
                    Alterar
                  </button>
                </div>

                <div className="endereco-resumo">
                  <strong>
                    {endereco.rua}, {endereco.numero}
                  </strong>

                  {endereco.complemento && <span>{endereco.complemento}</span>}

                  <span>{endereco.bairro}</span>

                  <span>
                    {endereco.cidade} - {endereco.estado}
                  </span>

                  <span>CEP: {endereco.cep}</span>
                </div>
              </div>

              {/* ==========================================
                  BOTÃO PAGAR
              ========================================== */}

              <button
                type="button"
                className="botao-pagar"
                onClick={continuarPagamento}
                disabled={finalizando || !opcaoFrete}
              >
                {pedidoCriado ? `Ver pedido #${pedidoCriado.id}` : finalizando
                  ? formaPagamento === "pix"
                    ? "Gerando Pix..."
                    : "Abrindo Mercado Pago..."
                  : "Ir para pagamento"}
              </button>
            </>
          )}
        </section>

        {/* ==========================================
            RESUMO DO PEDIDO
        ========================================== */}

        <aside className="resumo-pagamento">
          <h2>Resumo do pedido</h2>

          <div className="itens-resumo-pagamento">
            {carrinho.map((item, index) => (
              <div
                className="item-resumo-pagamento"
                key={`${item.variacaoId}-${index}`}
              >
                <img src={item.imagem} alt={item.nome} />

                <div className="informacoes-item">
                  <strong>{item.nome}</strong>

                  <span>
                    {item.cor} / {item.tamanho}
                  </span>

                  <span>Quantidade: {item.quantidade}</span>
                  <span>Unitário: {Number(item.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>

                <strong>
                  R${" "}
                  {(Number(item.preco) * Number(item.quantidade))
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>
              </div>
            ))}
          </div>

          <div className="linha-resumo-pagamento">
            <span>Subtotal</span>

            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </div>

          <div className="linha-resumo-pagamento">
            <span>{cotacao?.semFreteParaTeste ? "Entrega" : "Frete"}</span>

            <span>{cotacao?.semFreteParaTeste ? "Suspensa para teste" : opcaoFrete ? `R$ ${frete.toFixed(2).replace(".", ",")}` : "Validando frete..."}</span>
          </div>

          {opcaoFrete && !cotacao?.semFreteParaTeste && <p>{opcaoFrete.transportadora} · {opcaoFrete.servico}<br />
            {cotacao?.semFreteParaTeste ? "Frete zerado para teste. Nenhum envio será contratado." : `Prazo estimado: ${opcaoFrete.prazoDias} dias úteis após postagem.`}</p>}
          {cotacao?.semFreteParaTeste && <p role="status">O modo sem frete não simula o pagamento. Com credenciais de produção, a cobrança será real.</p>}
          {cotacao?.sandbox && <p role="status">Frete de teste (Sandbox). A cobrança real exige frete de produção.</p>}

          <hr />

          <div className="total-pagamento">
            <span>Total</span>

            <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
