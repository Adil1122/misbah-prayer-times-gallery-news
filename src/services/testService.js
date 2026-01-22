import axiosClient from '../api/axios';

const TestService = {
    checkHealth: async () => {
        return await axiosClient.get('/api/health-check');
    },

    // Debug helper to inspect config
    getConfig: () => {
        return axiosClient.defaults;
    }
};

export default TestService;
