import test from "node:test";
import assert from "node:assert/strict";
import { segundosRestantes, formatarPrazo } from "./prazoPagamento.js";

test("prazo usa a data persistida, sem reiniciar os 15 minutos", () => {
  const inicio = Date.parse("2026-09-22T12:00:00Z");
  const fim = "2026-09-22T12:15:00Z";
  assert.equal(segundosRestantes(fim, inicio), 900);
  assert.equal(segundosRestantes(fim, inicio + 5 * 60000), 600);
  assert.equal(segundosRestantes(fim, inicio + 16 * 60000), 0);
});
test("pedidos legados sem prazo não recebem contador", () => {
  assert.equal(segundosRestantes(null), null);
  assert.equal(segundosRestantes("inválido"), null);
});
test("formatação do contador", () => {
  assert.equal(formatarPrazo(900), "15:00");
  assert.equal(formatarPrazo(65), "01:05");
  assert.equal(formatarPrazo(0), "00:00");
});
