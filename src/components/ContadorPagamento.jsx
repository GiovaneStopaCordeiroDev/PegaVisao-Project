import { useEffect, useState } from "react";
import { segundosRestantes, formatarPrazo } from "../services/prazoPagamento";
import "./contadorPagamento.css";

export function ContadorPagamento({ expiraEm, servidorAgora, onVencer }) {
  const [referencia, setReferencia] = useState(() => ({ local: Date.now(), servidor: Date.parse(servidorAgora) || Date.now() }));
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const local = Date.now();
    setReferencia({ local, servidor: Date.parse(servidorAgora) || local });
    setAgora(local);
  }, [servidorAgora]);
  useEffect(() => {
    if (!expiraEm) return;
    const timer = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiraEm]);
  const segundos = segundosRestantes(expiraEm, referencia.servidor + agora - referencia.local);
  useEffect(() => { if (segundos === 0) onVencer?.(); }, [segundos, onVencer]);
  if (segundos === null) return null;
  return <div className={`prazo-pagamento ${segundos === 0 ? "prazo-pagamento-vencido" : ""}`}>
    {segundos > 0 ? <>
      <span>Tempo para pagar</span>
      <strong role="timer" aria-label="Tempo restante para pagar">{formatarPrazo(segundos)}</strong>
    </> : <p role="status">Prazo encerrado. Estamos verificando o pagamento. Se você já pagou, aguarde a confirmação.</p>}
  </div>;
}
