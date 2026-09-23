import { useEffect, useRef, useState } from "react";
import { loginGoogle } from "../../services/auth";
import { Link } from "react-router-dom";

let carregamento;
function carregarGoogle() {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (!carregamento) carregamento = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => { script.remove(); carregamento = undefined; reject(new Error("Não foi possível carregar o Google. Use e-mail e senha ou recarregue a página.")); };
        document.head.appendChild(script);
    });
    return carregamento;
}

export function GoogleLogin({ onSuccess }) {
    const container = useRef(null);
    const sucesso = useRef(onSuccess);
    useEffect(() => { sucesso.current = onSuccess; }, [onSuccess]);
    const [erro, setErro] = useState("");
    const [credencial, setCredencial] = useState("");
    const [senha, setSenha] = useState("");
    const [ocupado, setOcupado] = useState(false);
    const processando = useRef(false);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    async function autenticar(token, senhaAtual) {
        if (processando.current) return;
        processando.current = true;
        setOcupado(true);
        setErro("");
        try {
            await loginGoogle(token, senhaAtual);
            setCredencial("");
            sucesso.current();
        } catch (error) {
            if (error.response?.data?.codigo === "VINCULO_REQUER_SENHA") setCredencial(token);
            setErro(error.response?.status === 429 ? "Muitas tentativas. Aguarde um minuto." :
                error.response?.data?.mensagem || "Não foi possível entrar com Google. Tente novamente.");
        } finally { processando.current = false; setOcupado(false); }
    }

    useEffect(() => {
        if (!clientId) return;
        let ativo = true;
        carregarGoogle().then(() => {
            if (!ativo || !container.current) return;
            window.google.accounts.id.initialize({ client_id: clientId, auto_select: false,
                callback: response => { if (ativo) autenticar(response.credential); } });
            window.google.accounts.id.renderButton(container.current, {
                theme: "outline", size: "large", text: "signin_with", locale: "pt-BR",
                width: Math.min(350, container.current.clientWidth), shape: "rectangular"
            });
        }).catch(error => { if (ativo) setErro(error.message); });
        return () => { ativo = false; };
    }, [clientId]);

    return <section className="login-google" aria-label="Acesso com Google" aria-busy={ocupado}>
        <div className="login-divisor"><span>ou</span></div>
        {clientId ? <div ref={container} className="google-botao" /> : <>
            <button type="button" disabled>Entrar com Google</button>
            <p className="login-ajuda">Acesso com Google em breve.</p>
        </>}
        {ocupado && <p role="status" className="login-ajuda">Validando seu acesso…</p>}
        {erro && <p role="alert" className="login-feedback">{erro}</p>}
        {credencial && <form onSubmit={event => { event.preventDefault(); autenticar(credencial, senha); }}>
            <div className="campo-login">
                <label htmlFor="senha-vinculo">Senha atual da PegaVisão</label>
                <input id="senha-vinculo" type="password" autoComplete="current-password" required
                    value={senha} onChange={event => setSenha(event.target.value)} />
            </div>
            <button type="submit" disabled={ocupado}>Confirmar e vincular Google</button>
            <Link className="login-link" to="/esqueci-senha">Não lembro minha senha</Link>
            <button className="login-texto" type="button" disabled={ocupado}
                onClick={() => { setCredencial(""); setSenha(""); setErro(""); }}>Cancelar vínculo</button>
        </form>}
    </section>;
}
