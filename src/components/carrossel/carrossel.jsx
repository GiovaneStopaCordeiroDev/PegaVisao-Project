import { useState, useEffect } from "react";

import "./carrossel.css";

import imgcarrossel1 from "../../assets/imgcarrossel1.jpg";
import imgcarrossel2 from "../../assets/imgcarrossel2.png";
import imgcarrossel3 from "../../assets/imgcarrossel3.png";

export function Carrossel() {
  const [slideAtual, setSlideAtual] = useState(0);

  const imagens = [
    imgcarrossel1,
    imgcarrossel2,
    imgcarrossel3,
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideAtual((slide) => (slide + 1) % imagens.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [imagens.length]);

  const irParaSlide = (index) => {
    setSlideAtual(index);
  };

  const proximoSlide = () => {
    setSlideAtual((slide) => (slide + 1) % imagens.length);
  };

  const slideAnterior = () => {
    setSlideAtual(
      (slide) => (slide - 1 + imagens.length) % imagens.length
    );
  };

  return (
    <section className="carrossel">

      <div
        className="carrossel-imagens"
        style={{
          transform: `translateX(-${slideAtual * 100}%)`,
        }}
      >
        {imagens.map((imagem, index) => (
          <img
            key={index}
            src={imagem}
            alt={`Banner ${index + 1} PegaVisão`}
          />
        ))}
      </div>

      <button
        className="carrossel-botao anterior"
        onClick={slideAnterior}
        aria-label="Slide anterior"
      >
        ❮
      </button>

      <button
        className="carrossel-botao proximo"
        onClick={proximoSlide}
        aria-label="Próximo slide"
      >
        ❯
      </button>

      <div className="carrossel-indicadores">
        {imagens.map((_, index) => (
          <button
            key={index}
            className={`indicador ${
              slideAtual === index ? "ativo" : ""
            }`}
            onClick={() => irParaSlide(index)}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}