
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { login } from "../../services/auth";
import { Link } from "react-router-dom";
import { GoogleLogin } from "./GoogleLogin";

import "./login.css";

export function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleLogin(event) {

        event.preventDefault();

        if (!email || !senha) {
            toast.error("Preencha e-mail e senha.");
            return;
        }

        try {

            setCarregando(true);

            await login(email, senha);

            toast.success("Login realizado com sucesso!");

            navigate("/");

        } catch (error) {

            const mensagem =
                (error.response?.status === 429 ? "Muitas tentativas. Aguarde um minuto e tente novamente." : error.response?.data?.mensagem) ||
                "E-mail ou senha inválidos.";

            toast.error(mensagem);

        } finally {

            setCarregando(false);

        }
    }

    return (

        <main className="pagina-login">

            <div className="login-container">

                <h1>Entrar</h1>

                <form onSubmit={handleLogin}>

                    <div className="campo-login">

                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                    <div className="campo-login">

                        <label htmlFor="senha">
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) =>
                                setSenha(e.target.value)
                            }
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando
                            ? "Entrando..."
                            : "Entrar"}
                    </button>

                </form>

                <Link className="login-link" to="/esqueci-senha">Esqueceu a senha?</Link>
                <GoogleLogin onSuccess={() => { toast.success("Login realizado com sucesso!"); navigate("/"); }} />

                {/* CADASTRO */}

                <div className="cadastro-login">

                    <span>
                        Ainda não tem uma conta?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                    >
                        Cadastre-se
                    </button>

                </div>

            </div>

        </main>

    );
}

