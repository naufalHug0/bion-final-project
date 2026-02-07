import axios from 'axios'
import { useAuthStore } from '../store/useStore'

const api = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(async (config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api