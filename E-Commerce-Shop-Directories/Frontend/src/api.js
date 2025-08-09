import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8001";
export const API_BASE_URL = "http://127.0.0.1:8001/api";
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/api",
});

export default api;
