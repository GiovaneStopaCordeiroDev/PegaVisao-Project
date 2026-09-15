export function Pedidos() {

    const pedidosMock = [
        {
            id: 1024,
            data: "12/09/2026",
            status: "Em entrega",
            total: 239.80,
            itens: [
                "Camiseta Oversized Preta GG",
                "Bermuda Cargo Bege G"
            ]
        },
        {
            id: 1025,
            data: "08/09/2026",
            status: "Entregue",
            total: 119.90,
            itens: [
                "Camiseta PegaVisão Marrom GG"
            ]
        }
    ];

    return (
        <div className="pagina-pedidos">

            <div className="cabecalho-pedidos">
                <h1>Meus Pedidos</h1>
                <p>Acompanhe o status das suas compras</p>
            </div>

            <div className="lista-pedidos">

                {pedidosMock.map(pedido => (
                    <div key={pedido.id} className="card-pedido">

                        <div className="pedido-topo">
                            <h2>Pedido #{pedido.id}</h2>
                            <span>{pedido.data}</span>
                        </div>

                        <div className={`status ${pedido.status.toLowerCase().replace(" ", "-")}`}>
                            {pedido.status}
                        </div>

                        <div className="pedido-itens">
                            {pedido.itens.map((item, index) => (
                                <p key={index}>{item}</p>
                            ))}
                        </div>

                        <div className="pedido-footer">
                            <h3>R$ {pedido.total}</h3>

                            <button>
                                Ver Detalhes
                            </button>
                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}