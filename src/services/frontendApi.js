import axios from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: BACKEND_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchDisplayData = async () => {
    try {
        const response = await apiClient.get(`/api/frontend/display-data?t=${new Date().getTime()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching display data:', error);
        throw error;
    }
};
