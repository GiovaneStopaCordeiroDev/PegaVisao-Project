import "./header.css";

import {
    ShoppingCart,
    Search,
    User,
    LogOut,
    Package
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import logo from "../../assets/imgHeaderLogo.png";

import {
    getUsuarioLogado,
    logout
} from "../../services/auth";

function Header() {
    const navigate = useNavigate();

    const [busca, setBusca] = useState("");
    const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);

    const usuario = getUsuarioLogado();

    function realizarBusca(event) {
        event.preventDefault();

        const termo = busca.trim();

        if (!termo) {
            navigate("/produtos");
            return;
        }

        navigate(`/produtos?busca=${encodeURIComponent(termo)}`);
    }

    function realizarLogout() {
        logout();

        setMenuUsuarioAberto(false);

        toast.success("Você saiu da sua conta.");

        navigate("/");
    }

    function abrirLogin() {
        navigate("/login");
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

                {/* LOGIN + BUSCA + CARRINHO */}
                <div className="header-inferior">

                    {/* USUÁRIO */}
                    <div className="usuario-header">

                        <button
                            className="icone-header"
                            type="button"
                            onClick={() => {
                                if (usuario) {
                                    setMenuUsuarioAberto(
                                        !menuUsuarioAberto
                                    );
                                } else {
                                    abrirLogin();
                                }
                            }}
                            aria-label={
                                usuario
                                    ? "Minha conta"
                                    : "Login"
                            }
                        >
                            <User size={27} />
                        </button>

                        {usuario && menuUsuarioAberto && (
                            <div className="menu-usuario">

                                <div className="usuario-info">
                                    <strong>
                                        Olá, {usuario.nome}
                                    </strong>

                                    <span>
                                        {usuario.email}
                                    </span>
                                </div>

                               {usuario.isAdmin ? (
                                  <button
                                      type="button"
                                      onClick={() => {
                                          setMenuUsuarioAberto(false);
                                          navigate("/admin");
                                      }}
                                  >
                                      <Package size={18} />
                                      Painel administrativo
                                  </button>
                              ) : (
                                  <button
                                      type="button"
                                      onClick={() => {
                                          setMenuUsuarioAberto(false);
                                          navigate("/pedidos");
                                      }}
                                  >
                                      <Package size={18} />
                                      Meus pedidos
                                  </button>
                              )}
                                <button
                                    type="button"
                                    onClick={realizarLogout}
                                >
                                    <LogOut size={18} />
                                    Sair
                                </button>

                            </div>
                        )}

                    </div>

                    {/* PESQUISA */}
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

            <nav className="menu-header">
                <a href="/">Início</a>

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