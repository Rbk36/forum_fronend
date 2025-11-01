import axios from "axios";

const API_URL = "https://forum-backend-5-ly5d.onrender.com/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
export default axiosInstance;
