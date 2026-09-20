import { Navigate } from "react-router-dom";
import { getUsuarioLogado } from "../../services/auth";

export function ProtectedRoute({ children, adminOnly = false }) {
    const usuario = getUsuarioLogado();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !usuario.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}