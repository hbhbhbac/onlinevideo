import axios from 'axios';
// const globalStore = useGlobalStore();
const service = axios.create({
    baseURL: "http://152.136.213.16:8001",
    // 不进行超时中断
    timeout: 0,
})
export default service;