// src/config/api.ts
//const API_URL = "http://192.168.0.102:5000/api";
const API_URL = "http://192.168.1.106:5000/api";
export const api = {
  getTareas: async (mes?: number, year?: number) => {
    const params = mes && year ? `?mes=${mes}&year=${year}` : "";
    const res = await fetch(`${API_URL}/tareas${params}`);
    return res.json();
  },

  getTarea: async (id: number) => {
    const res = await fetch(`${API_URL}/tareas/${id}`);
    return res.json();
  },

  createTarea: async (data: any) => {
    const res = await fetch(`${API_URL}/tareas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateTarea: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/tareas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteTarea: async (id: number) => {
    const res = await fetch(`${API_URL}/tareas/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  getPersonas: async () => {
    const res = await fetch(`${API_URL}/personas`);
    return res.json();
  },
};