import { Link } from "react-router-dom";
import "./footer.css";

export function Footer() {
    return (
        <footer>
            <div className="conteudo-footer">

                <div className="footer-marca">
                    <h2>PEGA<span>VISÃO</span></h2>
                    <p>
                        Estilo, atitude e identidade em cada peça.
                    </p>
                </div>

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

                <div className="footer-coluna">
                    <h4>Informações</h4>

                    <a href="">
                        Política de trocas
                    </a>

                    <a href="">
                        Privacidade
                    </a>

                    <a href="">
                        Entregas
                    </a>
                </div>

                <div className="footer-coluna">
                    <h4>Contato</h4>

                    <a href="">
                        WhatsApp
                    </a>

                    <a href="">
                        Instagram
                    </a>

                    <a href="">
                        E-mail
                    </a>
                </div>

            </div>

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