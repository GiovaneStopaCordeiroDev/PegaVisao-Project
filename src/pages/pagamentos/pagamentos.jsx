import { ContadorPagamento } from "../../components/ContadorPagamento";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import { registrarPixPendente, concluirPixPendente } from "../../services/pixPendente";
import { freteValido, chaveCarrinho, lerJsonSeguro } from "../../services/freteCheckout";
import { salvarPagamentoPendente, lerPagamentoPendente, limparPagamentoPendente, limparCheckoutConcluido } from "../../services/pagamentoPendente";
import "./pagamentos.css";

export function Pagamento() {
  const navigate = useNavigate();
  const [formaPagamento, setFormaPagamento] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [prazoVencido, setPrazoVencido] = useState(false);
  const [freteSalvo] = useState(() => lerJsonSeguro("freteCheckout"));
  const [cotacao, setCotacao] = useState(null);
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [pagamentoAnterior, setPagamentoAnterior] = useState(() => lerPagamentoPendente());
  const [carrinho] = useState(() => lerJsonSeguro("carrinho") || []);
  const [endereco] = useState(() => lerJsonSeguro("enderecoCheckout"));
  const [destinatario] = useState(() => lerJsonSeguro("destinatarioCheckout") || (() => { try { return JSON.parse(sessionStorage.getItem("destinatarioCheckout")) || null; } catch { return null; } })());

  useEffect(() => {
    if (!pagamentoAnterior?.pedidoId) return;
    const controller = new AbortController();
    api.get(`/Pedido/${pagamentoAnterior.pedidoId}`, { signal: controller.signal, timeout: 10000 })
      .then(({ data }) => {
        if (data.status === "Pago") {
          limparCheckoutConcluido();
          setPagamentoAnterior(null);
          navigate(`/pagamento-concluido?pedido=${data.id}`, { replace: true });
        } else if (data.status === "Cancelado") {
          limparPagamentoPendente();
          setPagamentoAnterior(null);
        }
      }).catch(() => {});
    return () => controller.abort();
  }, [pagamentoAnterior?.pedidoId, navigate]);

  useEffect(() => {
    if (!pixData?.pedidoId) return;
    let ativo = true; let timer; const controller = new AbortController();
    async function consultar() {
      try {
        const { data } = await api.get(`/Pedido/${pixData.pedidoId}`, { signal: controller.signal, timeout: 10000 });
        if (!ativo) return;
        if (data.status === "Pago") {
          concluirPixPendente(data); limparCheckoutConcluido(); toast.success("Pagamento confirmado!");
          navigate(`/pagamento-concluido?pedido=${data.id}`, { replace: true }); return;
        }
        if (data.status === "Cancelado") { setPrazoVencido(true); limparPagamentoPendente(); toast.error("Este pedido foi cancelado."); return; }
      } catch (error) { if (!ativo) return; }
      if (ativo) timer = setTimeout(consultar, 5000);
    }
    consultar(); return () => { ativo = false; clearTimeout(timer); controller.abort(); };
  }, [pixData?.pedidoId, navigate]);

  const subtotal = pedidoCriado?.subtotalProdutos ?? cotacao?.subtotal ?? carrinho.reduce((t, i) => t + Number(i.preco) * Number(i.quantidade), 0);
  const opcaoFrete = cotacao?.opcoes?.find((o) => o.servicoId === freteSalvo?.servicoId);
  const frete = pedidoCriado?.valorFrete ?? opcaoFrete?.valor ?? 0;
  const total = subtotal + frete;

  useEffect(() => {
    if (pagamentoAnterior?.pedidoId) return;
    if (!endereco || !carrinho.length) return;
    if (!freteValido(freteSalvo, endereco.cep, carrinho)) { toast.error("Calcule o frete novamente antes de continuar."); navigate("/checkout", { replace:true }); return; }
    const controller = new AbortController();
    api.get(`/api/Frete/cotacoes/${freteSalvo.id}`, { signal:controller.signal }).then(({data}) => {
      if (!freteValido({...data, servicoId:freteSalvo.servicoId, carrinhoChave:freteSalvo.carrinhoChave}, endereco.cep, carrinho)) throw new Error();
      setCotacao(data);
    }).catch((error) => { if (!controller.signal.aborted) { toast.error(error.response?.data?.mensagem || "Não foi possível validar o frete."); navigate("/checkout", {replace:true}); }});
    return () => controller.abort();
  }, [freteSalvo,endereco,carrinho,navigate,pagamentoAnterior?.pedidoId]);

  useEffect(() => {
    if (pagamentoAnterior?.pedidoId) return;
    if (!destinatario?.cpf || !destinatario?.telefone || !endereco || !carrinho.length) navigate("/checkout", {replace:true});
  }, [destinatario,endereco,carrinho.length,navigate,pagamentoAnterior?.pedidoId]);

  async function continuarPagamento() {
    if (pedidoCriado) { navigate("/pedidos"); return; }
    if (!opcaoFrete || !freteValido(freteSalvo,endereco?.cep,carrinho) || chaveCarrinho(lerJsonSeguro("carrinho")||[]) !== chaveCarrinho(carrinho)) { toast.error("Sua cotação venceu ou o carrinho mudou."); navigate("/checkout"); return; }
    if (!formaPagamento) { toast.error("Selecione uma forma de pagamento."); return; }
    try {
      setFinalizando(true);
      const pedido = { itens:carrinho.map(i=>({variacaoProdutoId:Number(i.variacaoId),quantidade:Number(i.quantidade)})), cpfDestinatario:destinatario?.cpf?.replace(/\D/g,"")||null, telefoneDestinatario:destinatario?.telefone?.replace(/\D/g,"")||null, cep:endereco.cep, rua:endereco.rua, numero:endereco.numero, complemento:endereco.complemento||null, bairro:endereco.bairro, cidade:endereco.cidade, estado:endereco.estado, formaPagamento:formaPagamento==="pix"?"Pix":"Cartão", cotacaoFreteId:cotacao.id, freteServicoId:opcaoFrete.servicoId };
      const response = await api.post("/Pedido",pedido); setPedidoCriado(response.data); salvarPagamentoPendente(response.data); setPagamentoAnterior(lerPagamentoPendente());
      if (formaPagamento === "pix") {
        if (!response.data.pixQrCode) { toast.error("O pedido foi criado, mas o código Pix não foi gerado."); return; }
        setPixData({qrCode:response.data.pixQrCode,qrCodeBase64:response.data.pixQrCodeBase64,paymentId:response.data.mercadoPagoPaymentId,pedidoId:response.data.id}); registrarPixPendente(response.data.id); toast.success("Pix gerado com sucesso!"); return;
      }
      if (!response.data.mercadoPagoCheckoutUrl) { toast.error("O pedido foi criado, mas o checkout do Mercado Pago não foi gerado."); return; }
      window.location.href=response.data.mercadoPagoCheckoutUrl;
    } catch(error) { if(error.response?.status===401){localStorage.removeItem("token");localStorage.removeItem("usuario");navigate("/login",{state:{redirectTo:"/checkout"}});return;} toast.error(error.response?.data?.mensagem||"Não foi possível realizar o pedido."); }
    finally { setFinalizando(false); }
  }

  function retomarPagamento(){ if(pagamentoAnterior?.checkoutUrl){ window.location.href=pagamentoAnterior.checkoutUrl; } else if(pagamentoAnterior?.pedidoId){ navigate("/pedidos"); } }
  async function copiarPix(){ if(!pixData?.qrCode||prazoVencido)return; try{await navigator.clipboard.writeText(pixData.qrCode);toast.success("Código Pix copiado!");}catch{toast.error("Não foi possível copiar o código Pix.");}}
  if (!endereco && !pagamentoAnterior?.pedidoId) return null;

  if (pagamentoAnterior?.pedidoId && !pixData && !pedidoCriado) return <main className="pagina-pagamento"><div className="cabecalho-pagamento"><h1>Pagamento pendente</h1><p>Seu pedido #{pagamentoAnterior.pedidoId} já foi gerado. Continue nele para evitar pedidos duplicados.</p></div><div className="conteudo-pagamento"><section className="area-pagamento"><div className="bloco-pagamento"><h2>Pedido aguardando pagamento</h2><button type="button" className="botao-pagar" onClick={retomarPagamento}>{pagamentoAnterior.checkoutUrl?"Retornar ao pagamento":"Ver pedido"}</button><button type="button" onClick={()=>navigate("/pedidos")}>Ir para Meus pedidos</button></div></section></div></main>;

  return <main className="pagina-pagamento"><div className="cabecalho-pagamento"><h1>Pagamento</h1><p>{pixData?"Escaneie o QR Code ou copie o código Pix para pagar.":"Escolha como deseja pagar seu pedido."}</p></div><div className="conteudo-pagamento"><section className="area-pagamento">
    {pixData ? <div className="bloco-pagamento pix-gerado"><h2>Pagamento via Pix</h2><ContadorPagamento expiraEm={pedidoCriado?.pagamentoExpiraEm} servidorAgora={pedidoCriado?.servidorAgora} onVencer={()=>setPrazoVencido(true)}/>{!prazoVencido&&<><p>Escaneie o QR Code abaixo usando o aplicativo do seu banco.</p>{pixData.qrCodeBase64&&<div className="qr-code-container"><img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" className="qr-code-pix"/></div>}<div className="pix-codigo"><strong>Código Pix</strong><div className="pix-codigo-box"><span>{pixData.qrCode}</span></div><button type="button" className="botao-copiar-pix" onClick={copiarPix}>Copiar código Pix</button></div></>}<div className="pix-informacoes"><strong>Pedido #{pixData.pedidoId}</strong><span>Após realizar o pagamento, aguarde a confirmação.</span></div></div>
    : <><div className="bloco-pagamento"><h2>Forma de pagamento</h2><p>Após gerar o pagamento, você terá 15 minutos para pagar.</p><div className="opcoes-pagamento"><button type="button" className={`opcao-pagamento ${formaPagamento==="pix"?"selecionado":""}`} onClick={()=>setFormaPagamento("pix")} disabled={finalizando}><div className="icone-pagamento">PIX</div><div className="texto-opcao"><strong>Pix</strong><span>Pagamento instantâneo</span></div></button><button type="button" className={`opcao-pagamento ${formaPagamento==="cartao"?"selecionado":""}`} onClick={()=>setFormaPagamento("cartao")} disabled={finalizando}><div className="icone-pagamento">💳</div><div className="texto-opcao"><strong>Cartão</strong><span>Crédito ou débito</span></div></button></div></div><button type="button" className="botao-pagar" onClick={continuarPagamento} disabled={finalizando||!opcaoFrete}>{finalizando?"Gerando pagamento...":"Ir para pagamento"}</button></>}
  </section><aside className="resumo-pagamento"><h2>Resumo do pedido</h2>{carrinho.map((item,index)=><div className="item-resumo-pagamento" key={`${item.variacaoId}-${index}`}><img src={item.imagem} alt={item.nome}/><div className="informacoes-item"><strong>{item.nome}</strong><span>{item.cor} / {item.tamanho}</span><span>Quantidade: {item.quantidade}</span></div></div>)}<div className="linha-resumo-pagamento"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace(".",",")}</span></div><div className="linha-resumo-pagamento"><span>Frete</span><span>R$ {frete.toFixed(2).replace(".",",")}</span></div><hr/><div className="total-pagamento"><span>Total</span><strong>R$ {total.toFixed(2).replace(".",",")}</strong></div></aside></div></main>;
}