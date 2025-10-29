import axios from "axios";

const API_URL = "http://localhost:5500/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
export default axiosInstance;
