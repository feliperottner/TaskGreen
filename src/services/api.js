import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.3.110:8080', // usa seu IP local
  timeout: 5000,
});

export default api;
