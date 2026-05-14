import axios from 'axios';


// const BASE = import.meta.env.VITE_API_URL || '';
const BASE = 'https://switchitmart-backend.onrender.com';

// const api = axios.create({ 
//   baseURL: `${BASE}/api` 
// });
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = axios.create({ 
  baseURL: `${BASE}/api/admin` 
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;







// import axios from 'axios';

// const BASE = 'https://switchitmart-backend.onrender.com';

// const api = axios.create({ 
//   baseURL: `${BASE}/api` 
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (r) => r,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       if (!window.location.pathname.startsWith('/admin')) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export const adminApi = axios.create({ 
//   baseURL: `${BASE}/api/admin` 
// });

// adminApi.interceptors.request.use((config) => {
//   const token = localStorage.getItem('adminToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// adminApi.interceptors.response.use(
//   (r) => r,
//   (error) => {
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       localStorage.removeItem('adminToken');
//       localStorage.removeItem('adminUser');
//       window.location.href = '/admin/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;