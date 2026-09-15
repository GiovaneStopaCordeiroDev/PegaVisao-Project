import "./header.css";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/imgHeaderLogo.png";

function Header() {

    const navigate = useNavigate();

    return (
        <header>
            <div className="conteudo-header">

                <img
                    className="logo-header"
                    src={logo}
                    alt="PegaVisão"
                />

                <button
                    className="botao-carrinho"
                    onClick={() => navigate("/carrinho")}
                >
                    <ShoppingCart
                        size={28}
                        color="#FFFFFF"
                        strokeWidth={2}
                    />
                </button>

            </div>
        </header>
    );
}

export default Header;