export function DadosEnvioProduto({ produto, onChange, prefixo }) {
  return (
    <fieldset className="dados-envio-produto">
      <legend>Dados para entrega</legend>
      <p>Informe as medidas de uma unidade preparada para envio, incluindo sua embalagem.
        Esses dados serão usados em todas as variações deste produto.</p>
      {[
        ["pesoKg", "Peso (kg)", "0.001", "0.001"],
        ["alturaCm", "Altura (cm)", "0.1", "0.1"],
        ["larguraCm", "Largura (cm)", "0.1", "0.1"],
        ["comprimentoCm", "Comprimento (cm)", "0.1", "0.1"],
      ].map(([campo, label, min, step]) => (
        <div key={campo}>
          <label htmlFor={`${prefixo}-${campo}`}>{label}</label>
          <input id={`${prefixo}-${campo}`} name={campo} type="number" min={min} max="1000"
            step={step} required value={produto[campo] ?? ""} onChange={onChange} />
        </div>
      ))}
    </fieldset>
  );
}
