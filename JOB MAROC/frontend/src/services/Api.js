import axios from "axios";

export const Api = axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL,
    withCredentials:true,
})


// export const getUsers = async () => {
//     try {
//         const response = await Api.get('/users/all');
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         throw error;
//     }
// }

// export const signin = async (data) => {
//     try {
//         const response = await Api.post('/signin', data);
//         return response.data;
//     } catch (error) {
//         console.error("Error signing in:", error);
//         throw error;
//     }
// }