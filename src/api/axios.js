import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for Sanctum cookies
});

// Interceptors can be added here
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            console.warn('Unauthorized access - redirecting to login...');
            // window.location.href = '/login'; 
        }
        throw error;
    }
);

export default axiosClient;
