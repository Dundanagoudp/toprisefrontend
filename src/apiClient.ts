import axios from "axios"
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
        // Handle FormData requests
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data"
    }

    // Handle GET requests with body data
    if (config.method === "get" && config.data) {
      config.headers["Content-Type"] = "application/json"
      console.log("GET Request with body:", {
        url: config.url,
        data: config.data,
      })
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      timeout: error.code === 'ECONNABORTED'
    })
    
    if (error.response) {
      console.error("Error response data:", error.response.data)
      console.error("Error response status:", error.response.status)
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout - the server took too long to respond")

    }
    
    return Promise.reject(error)
  },
)

export default apiClient