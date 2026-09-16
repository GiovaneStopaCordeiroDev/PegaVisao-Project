import "./header.css";
import { ShoppingCart, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgHeaderLogo.png";

function Header() {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="top-header">

                <img
                    src={logo}
                    alt="PegaVisão"
                    className="logo-header"
                    onClick={() => navigate("/")}
                />

                <div className="barra-pesquisa">
                    <input
                        type="text"
                        placeholder="O que você está procurando?"
                    />
                    <button>
                        <Search size={22} />
                    </button>
                </div>

                <div className="acoes-header">

                    <button className="icone-header">
                        <User size={24} />
                    </button>

                    <button
                        className="icone-header"
                        onClick={() => navigate("/carrinho")}
                    >
                        <ShoppingCart size={24} />
                    </button>

                </div>
            </div>

            <nav className="menu-header">
                <a href="/">Início</a>
                <a href="#camisetas">Camisetas</a>
                <a href="#moletons">Moletons</a>
                <a href="#calcas">Calças</a>
                <a href="#tenis">Tênis</a>
            </nav>
        </header>
    );
}

export default Header;