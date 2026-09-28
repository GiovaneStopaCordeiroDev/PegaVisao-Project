import test from "node:test";
import assert from "node:assert/strict";
import { dataBrasiliaInput, dataBrasiliaUtc, itensCupom } from "./cupons.js";
test("datas usam Brasília independentemente do fuso do navegador", () => {
  assert.equal(dataBrasiliaInput("2026-09-28T03:00:00Z"), "2026-09-28T00:00");
  assert.equal(dataBrasiliaUtc("2026-09-28T00:00"), "2026-09-28T03:00:00.000Z");
});
test("validação de cupom não envia preço informado no navegador", () => {
  assert.deepEqual(itensCupom([{ variacaoId: "2", quantidade: "3", preco: .01, desconto: 999 }]), [{ variacaoProdutoId: 2, quantidade: 3 }]);
});
