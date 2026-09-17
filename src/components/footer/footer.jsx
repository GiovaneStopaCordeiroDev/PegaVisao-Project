import { Link } from "react-router-dom";

import "./footer.css";

import americanExpress from "../../assets/pagamentos/americanexpress.png";
import elo from "../../assets/pagamentos/elologo.png";
import mastercard from "../../assets/pagamentos/mastercardlogo.png";
import mercadoPago from "../../assets/pagamentos/mercadopagologo.png";
import pix from "../../assets/pagamentos/pixlogo.png";
import visa from "../../assets/pagamentos/visalogo.png";

export function Footer() {
    return (
        <footer>

            <div className="conteudo-footer">

                {/* =========================================
                    MARCA
                ========================================= */}

                <div className="footer-marca">

                    <h2>
                        PEGA<span>VISÃO</span>
                    </h2>

                    <p>
                        Estilo, atitude e identidade em cada peça.
                    </p>

                </div>

                {/* =========================================
                    CATEGORIAS
                ========================================= */}

                <div className="footer-coluna">

                    <h4>Categorias</h4>

                    <Link to="/produtos?categoria=8">
                        Camisetas
                    </Link>

                    <Link to="/produtos?categoria=6">
                        Moletons
                    </Link>

                    <Link to="/produtos?categoria=7">
                        Calças
                    </Link>

                    <Link to="/produtos?categoria=5">
                        Tênis
                    </Link>

                </div>

                {/* =========================================
                    INFORMAÇÕES
                ========================================= */}

                <div className="footer-coluna">

                    <h4>Informações</h4>

                    <a href="#">
                        Política de trocas
                    </a>

                    <a href="#">
                        Privacidade
                    </a>

                    <a href="#">
                        Entregas
                    </a>

                </div>

                {/* =========================================
                    CONTATO
                ========================================= */}

                <div className="footer-coluna">

                    <h4>Contato</h4>

                    <a
                        href="https://wa.me/5514991851217"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        WhatsApp
                    </a>

                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Instagram
                    </a>

                    <a href="#">
                        E-mail
                    </a>

                </div>

            </div>

            {/* =========================================
                FORMAS DE PAGAMENTO
            ========================================= */}

            <div className="pagamentos-footer">

                <h4>Formas de pagamento</h4>

                <div className="logos-pagamentos">

                    <img
                        src={pix}
                        alt="Pix"
                    />

                    <img
                        src={mercadoPago}
                        alt="Mercado Pago"
                    />

                    <img
                        src={visa}
                        alt="Visa"
                    />

                    <img
                        src={mastercard}
                        alt="Mastercard"
                    />

                    <img
                        src={elo}
                        alt="Elo"
                    />

                    <img
                        src={americanExpress}
                        alt="American Express"
                    />

                </div>

            </div>

            {/* =========================================
                FINAL
            ========================================= */}

            <div className="footer-final">

                <span></span>

                <p>
                    © 2026 PegaVisão. Todos os direitos reservados.
                </p>

                <span></span>

            </div>

        </footer>
    );
}

export default Footer;