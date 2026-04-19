// WHAT: Configured Axios instance for all API calls
// WHY: Instead of typing full URL every time,
//      we configure once and reuse everywhere
// HOW: baseURL + credentials sent automatically

import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // WHAT: Base URL from .env file
    // WHY: In dev → http://localhost:5000/api
    //      In prod → https://shopease-api.render.com/api
    // Changing one line switches all API calls!

    withCredentials: true,
    // WHY: Allows cookies to be sent with requests
    // Without this, JWT cookie never reaches backend
    // Like telling the browser "send your ID card with every request"
});

export default API;