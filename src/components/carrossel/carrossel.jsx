import { useState, useEffect } from "react";

import "./carrossel.css";

import imgcarrossel1 from "../../assets/imgcarrossel1.jpg";
import imgcarrossel2 from "../../assets/imgcarrossel2.jpg";
import imgcarrossel3 from "../../assets/imgcarrossel3.png";

const imagens = [
  imgcarrossel1,
  imgcarrossel2,
  imgcarrossel3
];

export function Carrossel() {

  const [indice, setIndice] = useState(0);

  useEffect(() => {

    const intervalo = setInterval(() => {

      setIndice((atual) => (atual + 1) % imagens.length);

    }, 10000);

    return () => clearInterval(intervalo);

  }, []);

  function mudarImagem(novoIndice) {
    setIndice(novoIndice);
  }

  return (

    <div className="carrossel">

      <div
        className="carrossel-imagens"
        style={{
          transform: `translateX(-${indice * 100}%)`
        }}
      >

        {imagens.map((imagem, index) => (

          <img
            key={index}
            src={imagem}
            alt={`Banner ${index + 1}`}
          />

        ))}

      </div>

      <div className="indicadores">

        {imagens.map((_, index) => (

          <button
            key={index}
            className={indice === index ? "bolinha ativa" : "bolinha"}
            onClick={() => mudarImagem(index)}
            aria-label={`Ir para imagem ${index + 1}`}
          />

        ))}

      </div>

    </div>

  );

}