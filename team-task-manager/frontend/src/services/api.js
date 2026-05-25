import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export const authAPI = {
  me: () => API.get("/api/auth/me"),
  login: (email, password) =>
    API.post("/api/auth/login", { email, password }),
  signup: (name, email, password) =>
    API.post("/api/auth/signup", { name, email, password }),
  logout: () => API.get("/api/auth/logout"),
};

export const projectAPI = {
  getMyProjects: () => API.get("/api/projects/my-projects"),
  create: (data) => API.post("/api/projects/create", data),
  addMember: (projectId, email) =>
    API.post(`/api/projects/add-member/${projectId}`, { email }),
  removeMember: (projectId, userId) =>
    API.delete(`/api/projects/remove-member/${projectId}/${userId}`),
};

export const taskAPI = {
  getByProject: (projectId) =>
    API.get(`/api/tasks/project/${projectId}`),
  create: (projectId, data) =>
    API.post(`/api/tasks/create/${projectId}`, data),
  updateStatus: (taskId, status) =>
    API.put(`/api/tasks/update-status/${taskId}`, { status }),
  delete: (taskId) => API.delete(`/api/tasks/delete/${taskId}`),
};

export const dashboardAPI = {
  getStats: () => API.get("/api/dashboard/dashboard"),
};

export default API;
