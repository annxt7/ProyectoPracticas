import axios from "axios";

const api = axios.create({
  baseURL: "/api", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tribe_token');
  
  if (token) {
    const cleanToken = token.replace(/^"|"$/g, ''); 
    
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  
  return config;
});

export default api;