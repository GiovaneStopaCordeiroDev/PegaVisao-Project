import { useState } from "react";
import { Link } from "react-router-dom";
import { recuperarSenha, redefinirSenha } from "../../services/auth";
import "./login.css";

export function RecuperarSenha({ redefinir = false }) {
    const [link] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
    const [email, setEmail] = useState(redefinir ? link.get("email") || "" : "");
    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [ocupado, setOcupado] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [concluido, setConcluido] = useState(false);
    const invalido = redefinir && (!link.get("token") || !link.get("email"));

    async function enviar(event) {
        event.preventDefault();
        setErro(""); setMensagem("");
        if (redefinir && senha !== confirmacao) { setErro("As senhas precisam ser iguais."); return; }
        if (redefinir && (senha.length < 8 || new TextEncoder().encode(senha).length > 72)) {
            setErro("Use ao menos 8 caracteres e no máximo 72 bytes na senha."); return;
        }
        setOcupado(true);
        try {
            const resposta = redefinir ? await redefinirSenha(email, link.get("token"), senha) : await recuperarSenha(email);
            setMensagem(resposta.mensagem);
            setConcluido(true);
            if (redefinir) { window.history.replaceState(null, "", window.location.pathname); setSenha(""); setConfirmacao(""); }
        } catch (error) {
            setErro(error.response?.status === 429 ? "Muitas tentativas. Aguarde um minuto e tente novamente." :
                error.response?.data?.mensagem || "Não foi possível concluir. Tente novamente em instantes.");
        } finally { setOcupado(false); }
    }

    return <main className="pagina-login"><div className="login-container">
        <h1>{redefinir ? "Nova senha" : "Esqueceu a senha?"}</h1>
        <p className="login-ajuda">{redefinir ? "Escolha uma nova senha para sua conta." : "Informe seu e-mail para receber o link de recuperação."}</p>
        {invalido ? <p role="alert" className="login-feedback">Link incompleto. <Link to="/esqueci-senha">Solicite um novo link.</Link></p> :
            !concluido && <form onSubmit={enviar}>
                <div className="campo-login"><label htmlFor="recuperacao-email">E-mail</label>
                    <input id="recuperacao-email" type="email" autoComplete="email" required maxLength={254}
                        readOnly={redefinir} value={email} onChange={event => setEmail(event.target.value)} /></div>
                {redefinir && <>
                    <div className="campo-login"><label htmlFor="nova-senha">Nova senha</label>
                        <input id="nova-senha" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                            value={senha} onChange={event => setSenha(event.target.value)} /></div>
                    <div className="campo-login"><label htmlFor="confirmar-senha">Confirmar nova senha</label>
                        <input id="confirmar-senha" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                            value={confirmacao} onChange={event => setConfirmacao(event.target.value)} /></div>
                </>}
                <button type="submit" disabled={ocupado}>{ocupado ? "Aguarde…" : redefinir ? "Salvar nova senha" : "Enviar link de recuperação"}</button>
            </form>}
        {erro && <p role="alert" className="login-feedback">{erro}</p>}
        {mensagem && <p role="status" className="login-feedback">{mensagem}</p>}
        {redefinir && erro && <Link className="login-link" to="/esqueci-senha">Solicitar novo link</Link>}
        <Link className="login-link" to="/login">Voltar para o login</Link>
    </div></main>;
}
