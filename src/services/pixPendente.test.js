import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarPixPendente, concluirPixPendente } from "./pixPendente.js";

function preparar() {
  const dados = new Map();
  globalThis.localStorage = {
    getItem: (key) => dados.get(key) ?? null,
    setItem: (key, value) => dados.set(key, String(value)),
    removeItem: (key) => dados.delete(key),
  };
  localStorage.setItem("carrinho", '[{"id":1}]');
  localStorage.setItem("enderecoCheckout", '{"rua":"Teste"}');
  registrarPixPendente(22);
}

test("Criar Pix ou consultar Pendente não limpa carrinho", () => {
  preparar();
  assert.equal(concluirPixPendente({ id: 22, status: "Pendente" }), false);
  assert.ok(localStorage.getItem("carrinho"));
});
test("Somente Pago do pedido correto limpa; repetir não causa efeitos", () => {
  preparar();
  assert.equal(concluirPixPendente({ id: 21, status: "Pago" }), false);
  assert.ok(localStorage.getItem("carrinho"));
  assert.equal(concluirPixPendente({ id: 22, status: "Pago" }), true);
  assert.equal(localStorage.getItem("carrinho"), null);
  assert.equal(concluirPixPendente({ id: 22, status: "Pago" }), false);
});
test("Preserva carrinho e endereço alterados após criar Pix", () => {
  preparar();
  localStorage.setItem("carrinho", "nova compra");
  localStorage.setItem("enderecoCheckout", "novo endereco");
  concluirPixPendente({ id: 22, status: "Pago" });
  assert.equal(localStorage.getItem("carrinho"), "nova compra");
  assert.equal(localStorage.getItem("enderecoCheckout"), "novo endereco");
});
test("Marcador inválido e pedido cancelado não limpam carrinho", () => {
  preparar();
  assert.equal(concluirPixPendente({ id: 22, status: "Cancelado" }), false);
  localStorage.setItem("pixPendente", "invalido");
  assert.equal(concluirPixPendente({ id: 22, status: "Pago" }), false);
  assert.ok(localStorage.getItem("carrinho"));
});
import { registrarPagamentoPendente, obterPagamentoPendente, concluirPagamentoPendente, limparPagamentoPendente, consultarPagamento, urlCheckoutSegura } from './pixPendente.js';

test('Cartão conserva dados até confirmação e limpa destinatário nas duas storages', () => {
  preparar();
  const dados = new Map();
  globalThis.sessionStorage = { getItem:k=>dados.get(k)??null, setItem:(k,v)=>dados.set(k,v), removeItem:k=>dados.delete(k) };
  localStorage.setItem('destinatarioCheckout', 'dados'); sessionStorage.setItem('destinatarioCheckout', 'dados');
  registrarPagamentoPendente({id:33});
  assert.equal(concluirPagamentoPendente({id:33,status:'Pendente'}),false);
  assert.equal(concluirPagamentoPendente({id:33,status:'Pago'}),true);
  assert.equal(localStorage.getItem('destinatarioCheckout'),null);
  assert.equal(sessionStorage.getItem('destinatarioCheckout'),null);
});
test('Novo carrinho mantém todos os dados e outro marcador pendente', () => {
  preparar(); registrarPagamentoPendente({id:33});
  localStorage.setItem('carrinho','nova compra');
  concluirPixPendente({id:22,status:'Pago'});
  assert.equal(obterPagamentoPendente().pedidoId,33);
  concluirPagamentoPendente({id:33,status:'Pago'});
  assert.equal(localStorage.getItem('enderecoCheckout'),'{"rua":"Teste"}');
});
test('Cancelamento remove somente referência correspondente, preservando checkout', () => {
  preparar(); registrarPagamentoPendente({id:33});
  limparPagamentoPendente(22);
  assert.equal(obterPagamentoPendente().pedidoId,33);
  limparPagamentoPendente(33);
  assert.equal(obterPagamentoPendente(),null);
  assert.ok(localStorage.getItem('carrinho'));
});
test('Marcador de outra conta não é usado', () => {
  preparar(); localStorage.setItem('usuario','{"id":1}'); registrarPagamentoPendente({id:33});
  localStorage.setItem('usuario','{"id":2}'); assert.equal(obterPagamentoPendente(),null);
});
test('Retomada consulta status e URL autenticados sem POST', async () => {
  const chamadas=[];
  const api={ get:async path=>{chamadas.push(path); return {data:path==='/Pedido/33'?{id:33,status:'Pendente'}:[{id:33,status:'Pendente',mercadoPagoCheckoutUrl:'https://www.mercadopago.com.br/checkout'}]};}};
  assert.equal((await consultarPagamento(api,33)).mercadoPagoCheckoutUrl,'https://www.mercadopago.com.br/checkout');
  assert.deepEqual(chamadas,['/Pedido/33','/Pedido']);
});
test('Pago e Cancelado não consultam nem reabrem checkout', async () => {
  for (const status of ['Pago','Cancelado']) {
    const api={get:async path=>{assert.equal(path,'/Pedido/33');return {data:{id:33,status}};}};
    assert.equal((await consultarPagamento(api,33)).status,status);
  }
});
test('Falha HTTP não autoriza retomada; URL externa ou javascript é bloqueada', async () => {
  await assert.rejects(consultarPagamento({get:async()=>{throw Error('503');}},33));
  for(const url of ['javascript:alert(1)','http://mercadopago.com','https://mercadopago.com.evil.test','https://user:pass@mercadopago.com']) assert.equal(urlCheckoutSegura(url),false);
  assert.equal(urlCheckoutSegura('https://www.mercadopago.com.br/checkout'),true);
});
