import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  // const token = await getFirebaseToken();
  // config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  // PERSONAS 
  getPersonas: async (rol?: string) => {
    const params = rol ? { rol } : {};
    const res = await apiClient.get("/personas", { params });
    return res.data;
  },
  getPersona: async (id: number) => {
    const res = await apiClient.get(`/personas/${id}`);
    return res.data;
  },
  createPersona: async (data: any) => {
    const res = await apiClient.post("/personas", data);
    return res.data;
  },
  updatePersona: async (id: number, data: any) => {
    const res = await apiClient.patch(`/personas/${id}`, data);
    return res.data;
  },
  deletePersona: async (id: number) => {
    const res = await apiClient.delete(`/personas/${id}`);
    return res.data;
  },

  //USUARIOS
  getUsuarios: async () => {
    const res = await apiClient.get("/usuarios");
    return res.data;
  },
  createUsuario: async (data: any) => {
    const res = await apiClient.post("/usuarios", data);
    return res.data;
  },
  deleteUsuario: async (id: number) => {
    const res = await apiClient.delete(`/usuarios/${id}`);
    return res.data;
  },

  //ROLES
  getRoles: async () => {
    const res = await apiClient.get("/roles");
    return res.data;
  },

  //TAREAS
  getTareas: async (mes?: number, year?: number) => {
    const params = mes && year ? { mes, year } : {};
    const res = await apiClient.get("/tareas", { params });
    return res.data;
  },
  getTarea: async (id: number) => {
    const res = await apiClient.get(`/tareas/${id}`);
    return res.data;
  },
  createTarea: async (data: any) => {
    const res = await apiClient.post("/tareas", data);
    return res.data;
  },
  updateTarea: async (id: number, data: any) => {
    const res = await apiClient.patch(`/tareas/${id}`, data);
    return res.data;
  },
  deleteTarea: async (id: number) => {
    const res = await apiClient.delete(`/tareas/${id}`);
    return res.data;
  },

  //AUTH
  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  //auth de desarrollo sin firebase
  devLogin: async (usuarioId: number) => {
    const res = await apiClient.get(`/auth/dev-login/${usuarioId}`);
    return res.data;
  },
 
// TRATAMIENTOS
  getTratamientos: async () => {
    const res = await apiClient.get("/tratamientos");
    return res.data;
  },
  createTratamientoEnVisita: async (visitaId: number, data: any) => {
    const res = await apiClient.post(`/visitas/${visitaId}/tratamientos`, data);
    return res.data;
  },
  updateTratamiento: async (id: number, data: any) => {
    const res = await apiClient.patch(`/tratamientos/${id}`, data);
    return res.data;
  },
  deleteTratamiento: async (id: number) => {
    const res = await apiClient.delete(`/tratamientos/${id}`);
    return res.data;
  },
  // Para crear visita (necesario para crearTratamientoCompleto)
  createVisita: async (animalId: number, data: any) => {
    const res = await apiClient.post(`/animales/${animalId}/visitas`, data);
    return res.data;
  },

//ANIMALES
  getAnimales: async (tipo?: string, estado_id?: number) => {
    const params: any = {};
    if (tipo) params.tipo = tipo;
    if (estado_id) params.estado_id = estado_id;
    const res = await apiClient.get("/animales", { params });
    return res.data;
  },
  getAnimal: async (id: number) => {
    const res = await apiClient.get(`/animales/${id}`);
    return res.data;
  },
  createAnimal: async (data: any) => {
    const res = await apiClient.post("/animales", data);
    return res.data;
  },
  updateAnimal: async (id: number, data: any) => {
    const res = await apiClient.patch(`/animales/${id}`, data);
    return res.data;
  },
  deleteAnimal: async (id: number) => {
    const res = await apiClient.delete(`/animales/${id}`);
    return res.data;
  },
  getVisitasAnimal: async (animalId: number) => {
    const res = await apiClient.get(`/animales/${animalId}/visitas`);
    return res.data;
  },

  //ESTADOS
  getEstados: async () => {
    const res = await apiClient.get("/estados");
    return res.data;
  },

  //COMPATIBILIDADES
  getCompatibilidades: async () => {
    const res = await apiClient.get("/compatibilidades");
    return res.data;
  },

};

