import axios from "axios";

const api = axios.create({
  baseURL: "https://nightbyte-1.onrender.com/api",
});

export default api;