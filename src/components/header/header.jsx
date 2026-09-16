import "./header.css";

import { ShoppingCart, Search, User } from "lucide-react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/imgHeaderLogo.png";

function Header() {
    const navigate = useNavigate();
    const [busca, setBusca] = useState("");

    function realizarBusca(event) {
        event.preventDefault();

        const termo = busca.trim();

        if (!termo) {
            navigate("/produtos");
            return;
        }

        navigate(`/produtos?busca=${encodeURIComponent(termo)}`);
    }

    return (
        <header className="header">

            <div className="top-header">

                {/* LOGO */}
                <img
                    src={logo}
                    alt="PegaVisão"
                    className="logo-header"
                    onClick={() => navigate("/")}
                />

                {/* BUSCA + LOGIN + CARRINHO */}
                <div className="busca-acoes">

                    <form
                        className="barra-pesquisa"
                        onSubmit={realizarBusca}
                    >
                        <input
                            type="text"
                            placeholder="O que você está procurando?"
                            value={busca}
                            onChange={(event) =>
                                setBusca(event.target.value)
                            }
                        />

                        <button
                            type="submit"
                            aria-label="Pesquisar"
                        >
                            <Search size={22} />
                        </button>
                    </form>

                    <div className="acoes-header">

                        {/* LOGIN */}
                        <button
                            className="icone-header"
                            type="button"
                            onClick={() => navigate("/login")}
                            aria-label="Login"
                        >
                            <User size={27} />
                        </button>

                        {/* CARRINHO */}
                        <button
                            className="icone-header"
                            type="button"
                            onClick={() => navigate("/carrinho")}
                            aria-label="Carrinho"
                        >
                            <ShoppingCart size={27} />
                        </button>

                    </div>

                </div>

            </div>

            {/* MENU */}
            <nav className="menu-header">

                <a href="/">
                    Início
                </a>

                <a href="/produtos?categoria=8">
                    Camisetas
                </a>

                <a href="/produtos?categoria=6">
                    Moletons
                </a>

                <a href="/produtos?categoria=7">
                    Calças
                </a>

                <a href="/produtos?categoria=5">
                    Tênis
                </a>

            </nav>

        </header>
    );
}

export default Header;
