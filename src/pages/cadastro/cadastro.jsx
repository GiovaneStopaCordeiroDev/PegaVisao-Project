import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { registrar } from "../../services/auth";

import "./cadastro.css";

export function Cadastro() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleCadastro(event) {
        event.preventDefault();

        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            toast.error("Preencha todos os campos.");
            return;
        }

        if (senha.length < 8 || new TextEncoder().encode(senha).length > 72) {
            toast.error("A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.");
            return;
        }

        if (senha !== confirmarSenha) {
            toast.error("As senhas não coincidem.");
            return;
        }

        try {
            setCarregando(true);

            await registrar(
                nome.trim(),
                email.trim(),
                senha
            );

            toast.success("Cadastro realizado com sucesso!");

            navigate("/login");
        } catch (error) {
            console.error(error);

            const mensagem =
                error.response?.data?.mensagem ||
                "Não foi possível realizar o cadastro.";

            toast.error(mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="pagina-cadastro">

            <div className="cadastro-container">

                <h1>Criar conta</h1>

                <p className="subtitulo-cadastro">
                    Cadastre-se para acompanhar seus pedidos.
                </p>

                <form onSubmit={handleCadastro}>

                    <div className="campo-cadastro">
                        <label htmlFor="nome">
                            Nome
                        </label>

                        <input
                            id="nome"
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(event) =>
                                setNome(event.target.value)
                            }
                            autoComplete="name"
                        />
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                        />
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="senha">
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(event) =>
                                setSenha(event.target.value)
                            }
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="campo-cadastro">
                        <label htmlFor="confirmarSenha">
                            Confirmar senha
                        </label>

                        <input
                            id="confirmarSenha"
                            type="password"
                            placeholder="Digite a senha novamente"
                            value={confirmarSenha}
                            onChange={(event) =>
                                setConfirmarSenha(event.target.value)
                            }
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando
                            ? "Cadastrando..."
                            : "Criar conta"}
                    </button>

                </form>

                <div className="login-link-cadastro">
                    <span>
                        Já possui uma conta?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Entrar
                    </button>
                </div>

            </div>

        </main>
    );
}
