import axios from "axios";

const api = axios.create({
    baseURL: "https://pegavisao-project-api.onrender.com"
});

export default api;