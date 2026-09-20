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
