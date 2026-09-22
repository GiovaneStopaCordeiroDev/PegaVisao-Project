import { useState } from "react";
import "./galeriaProduto.css";

export function GaleriaProduto({ produto }) {
  const imagens = [...new Set([produto.imagemPrincipal, produto.imagemSecundaria, produto.imagemTerciaria].filter(Boolean))];
  const [selecionada, setSelecionada] = useState(0);
  const indice = selecionada < imagens.length ? selecionada : 0;
  return <div className="galeria-produto">
    <div className="produto-imagem-container">
      <img src={imagens[indice]} alt={`${produto.nome} — imagem ${indice + 1}`} className="produto-imagem" />
    </div>
    {imagens.length > 1 && <div className="galeria-miniaturas" aria-label="Imagens do produto">
      {imagens.map((src, i) => <button key={src} type="button" onClick={() => setSelecionada(i)}
        aria-label={`Ver imagem ${i + 1} de ${produto.nome}`} aria-pressed={indice === i}>
        <img src={src} alt="" loading="lazy" />
      </button>)}
    </div>}
  </div>;
}
