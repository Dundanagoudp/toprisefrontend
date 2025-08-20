import axios  from "axios";
import Cookies from "js-cookie"


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://193.203.161.146:3000/api"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 45000, 
})


apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    
    // Handle FormData requests - don't override Content-Type for FormData
    if (config.data instanceof FormData) {
      // Remove any existing Content-Type header to let browser set it automatically
      delete config.headers["Content-Type"];
    }

    // Handle GET requests with body data
    if (config.method === "get" && config.data) {
      config.headers["Content-Type"] = "application/json"
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default apiClient