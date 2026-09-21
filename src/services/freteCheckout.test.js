import test from "node:test";
import assert from "node:assert/strict";
import { chaveCarrinho, freteValido, lerJsonSeguro } from "./freteCheckout.js";
const itens = [{ variacaoId: 1, quantidade: 2 }];
const cotacao = { id: "abc", servicoId: 1, cepDestino: "17013113", carrinhoChave: chaveCarrinho(itens), expiraEm: "2030-01-01", opcoes: [{ servicoId: 1 }] };
test("Agrupa variações repetidas e ignora a ordem", () => {
  assert.equal(chaveCarrinho(itens), chaveCarrinho([{ variacaoId: 1, quantidade: 1 }, { variacaoId: 1, quantidade: 1 }]));
});
test("Aceita cotação vigente do carrinho e CEP", () => {
  assert.equal(freteValido(cotacao, "17013-113", itens, 0), true);
});
test("Rejeita destino, quantidade, serviço ou validade alterados", () => {
  assert.equal(freteValido(cotacao, "01001000", itens, 0), false);
  assert.equal(freteValido(cotacao, "17013113", [{ variacaoId: 1, quantidade: 3 }], 0), false);
  assert.equal(freteValido({ ...cotacao, servicoId: 2 }, "17013113", itens, 0), false);
  assert.equal(freteValido(cotacao, "17013113", itens, Date.parse("2030-01-01")), false);
});
test("Dados ausentes ou corrompidos não liberam pagamento", () => {
  assert.equal(freteValido(null, "17013113", itens), false);
  assert.equal(freteValido({ ...cotacao, opcoes: {} }, "17013113", itens, 0), false);
  globalThis.localStorage = { getItem: () => "inválido" };
  assert.equal(lerJsonSeguro("freteCheckout"), null);
  delete globalThis.localStorage;
});
