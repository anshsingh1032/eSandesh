import axios from "axios";
axios.defaults.withCredentials=true

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5173/api" : import.meta.env.VITE_API_URL

export const axiosInstance = axios.create({
    baseURL,
    withCredentials:true
})