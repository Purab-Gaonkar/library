// src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Update this to your server's URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token in headers if authenticated
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
