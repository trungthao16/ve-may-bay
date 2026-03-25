// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default API;


import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;