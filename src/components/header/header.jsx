import "./header.css";

import { Search, ShoppingCart, User } from "lucide-react";
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

                <img
                    src={logo}
                    alt="PegaVisão"
                    className="logo-header"
                    onClick={() => navigate("/")}
                />

            </div>

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