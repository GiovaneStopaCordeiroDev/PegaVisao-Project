import { useEffect, useState } from "react";

import "./carrinho.css";

export function Carrinho() {

    const [carrinho, setCarrinho] = useState([]);

    useEffect(() => {

        const carrinhoSalvo =
            JSON.parse(localStorage.getItem("carrinho")) || [];

        setCarrinho(carrinhoSalvo);

    }, []);

    return (

        <main className="pagina-carrinho">

            <div className="cabecalho-carrinho">

                <h1>Meu Carrinho</h1>

                <p>
                    Confira os produtos que você adicionou.
                </p>

            </div>


            {carrinho.length === 0 ? (

                <div className="carrinho-vazio">

                    <h2>Seu carrinho está vazio</h2>

                    <p>
                        Adicione algum produto para continuar.
                    </p>

                </div>

            ) : (

                <div className="lista-carrinho">

                    {carrinho.map((item, index) => (

                        <div
                            className="card-carrinho"
                            key={`${item.variacaoId}-${index}`}
                        >

                            <img
                                src={item.imagem}
                                alt={item.nome}
                                className="imagem-carrinho"
                            />


                            <div className="informacoes-carrinho">

                                <h2>
                                    {item.nome}
                                </h2>

                                <p>
                                    Cor: {item.cor}
                                </p>

                                <p>
                                    Tamanho: {item.tamanho}
                                </p>

                                <p>
                                    Quantidade: {item.quantidade}
                                </p>

                                <strong>
                                    R$ {Number(item.preco)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                </strong>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </main>

    );
}