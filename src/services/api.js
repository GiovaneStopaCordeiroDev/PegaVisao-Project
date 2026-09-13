import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7263"
});

export default api;