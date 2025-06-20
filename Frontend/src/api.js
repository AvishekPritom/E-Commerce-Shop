import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8001";
const api = axios.create({
  baseURL: "http://127.0.0.1:8001/admin/shop_app/product/",
});

export default api;
