import axios from 'axios';

// Set global defaults for axios
axios.defaults.withCredentials = true;

// Add a request interceptor to handle context token header if needed
// Although we use cookies (ctx), some microservices might prefer headers
// or we might need it for specific cross-origin scenarios.
axios.interceptors.request.use(
    (config) => {
        // You could extract the context token from a non-HttpOnly cookie 
        // if we decided to use one, or from state if we pass it around.
        // For now, since we rely on HttpOnly cookies, the browser handles it.

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors (like 401)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if we are NOT on a public page
            const publicPages = ['/', '/login', '/forgot-password', '/reset-password'];
            const isPublic = publicPages.some(page => window.location.pathname === page || window.location.pathname.startsWith('/reset-password/'));

            if (!isPublic) {
                // If unauthorized and NOT on a public page, session probably expired
                // We could force a logout or redirect here
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
