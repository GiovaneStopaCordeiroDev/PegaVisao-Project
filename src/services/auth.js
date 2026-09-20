import api from "./api";

export async function login(email, senha) {
    const response = await api.post("/api/Auth/login", {
        email,
        senha
    });

    const usuario = response.data;

    localStorage.setItem("token", usuario.token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    return usuario;
}

export async function registrar(nome, email, senha) {
    const response = await api.post("/api/Auth/registrar", {
        nome,
        email,
        senha
    });

    return response.data;
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
}

export function getUsuarioLogado() {
    const usuario = localStorage.getItem("usuario");

    if (!usuario) {
        return null;
    }

    return JSON.parse(usuario);
}