export function segundosRestantes(expiraEm, agora = Date.now()) {
  const prazo = Date.parse(expiraEm);
  if (!Number.isFinite(prazo)) return null;
  return Math.max(0, Math.ceil((prazo - agora) / 1000));
}

export function formatarPrazo(segundos) {
  return `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
}
