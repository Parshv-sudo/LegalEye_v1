import axios from 'axios';

const resolveApiUrl = () => {
    let url = (import.meta.env.API_URL as string) || (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api/';
    if (!url.endsWith('/')) {
        url += '/';
    }
    return url;
};

const API_URL = resolveApiUrl();

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: Interceptor to handle 401s and refresh token (simplified for now)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
                    localStorage.setItem('access_token', response.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token failed, logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/';
                }
            } else {
                localStorage.removeItem('access_token');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export const matterApi = {
    getAll: () => api.get('matters/'),
    get: (id: number) => api.get(`matters/${id}/`),
    create: (data: any) => api.post('matters/', data),
    update: (id: number, data: any) => api.patch(`matters/${id}/`, data),
    delete: (id: number) => api.delete(`matters/${id}/`),
    generateDraft: (id: number, data: any) => api.post(`matters/${id}/generate_draft/`, data),
    analyze: (id: number) => api.post(`matters/${id}/analyze/`),
};

export const documentApi = {
    getAll: (matterId: number) => api.get(`documents/?matter_id=${matterId}`),
    getAllGlobal: () => api.get('documents/'),
    create: (data: any) => api.post('documents/', data),
    update: (id: number, data: any) => api.patch(`documents/${id}/`, data),
};

export const keyIssueApi = {
    create: (data: any) => api.post('keyissues/', data),
    update: (id: number, data: any) => api.patch(`keyissues/${id}/`, data),
};

export const chatLogApi = {
    create: (data: any) => api.post('chatlogs/', data),
};

export const ragApi = {
    chat: (matterId: number, query: string) => api.post('chat/', { matter_id: matterId, query }),
};

export const ingestApi = {
    upload: (matterId: number, file: File) => {
        const formData = new FormData();
        formData.append('matter_id', String(matterId));
        formData.append('file', file);
        return api.post('documents/ingest/', formData);
    },
};

export const chunksApi = {
    getEvidence: (matterId: number, docName?: string, page?: number, docNum?: number) => {
        const params = new URLSearchParams({ matter_id: String(matterId) });
        if (docName) params.append('doc_name', docName);
        if (page) params.append('page', String(page));
        if (docNum) params.append('doc_num', String(docNum));
        return api.get(`chunks/?${params.toString()}`);
    },
};

export const authApi = {
    login: (credentials: any) => axios.post(`${API_URL}token/`, credentials),
    verify: (token: string) => axios.post(`${API_URL}token/verify/`, { token }),
};
