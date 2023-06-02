import axios from 'axios';
// const globalStore = useGlobalStore();
const service = axios.create({
    baseURL: "http://127.0.0.1:8000",
    // 不进行超时中断
    timeout: 0,
})
export default service;