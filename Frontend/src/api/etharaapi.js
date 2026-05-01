import apiClient, { authHeader } from "./client";

export const authApi = {
  signup: (payload) => apiClient.post("/api/auth/signup", payload),
  login: (payload) => apiClient.post("/api/auth/login", payload),
};

export const userApi = {
  getProfile: () => apiClient.get("/api/auth/me", { headers: authHeader() }),
  getAllUsers: () => apiClient.get("/api/auth/users", { headers: authHeader() }),
  getsomeUsers: (ids) => apiClient.post("/api/auth/someusers", { ids }, { headers: authHeader() }),
};
export const projectApi = {
    createProject: (payload) => apiClient.post("/api/projects/create", payload, { headers: authHeader() }),
    fetchallProjects: () => apiClient.get("/api/projects/all", { headers: authHeader() }),
    fetchuserProjects: () => apiClient.get("/api/projects/myprojects", { headers: authHeader() }),
    fetchProjectById: (id) => apiClient.get(`/api/projects/${id}`, { headers: authHeader() }),
    updateProject: (id, payload) => apiClient.put(`/api/projects/${id}`, payload, { headers: authHeader() }),
    deleteProject: (id) => apiClient.delete(`/api/projects/${id}`, { headers: authHeader() }),
    addMember: (projectId, memberId) => apiClient.put(`/api/projects/${projectId}/${memberId}`, {},{ headers: authHeader() }),
    removeMember: (projectId, memberId) => apiClient.delete(`/api/projects/${projectId}/${memberId}`, { headers: authHeader() }),
};

export const taskApi = {
    createTask: (payload) => apiClient.post("/api/tasks/create", payload, { headers: authHeader() }),
    fetchProjectTasks: (projectId) => apiClient.get(`/api/tasks/project/${projectId}`, { headers: authHeader() }),
    fetchMyTasks: () => apiClient.get("/api/tasks/mine", { headers: authHeader() }),
    updateTaskStatus: (taskId, status) => apiClient.put(`/api/tasks/${taskId}/status`, { status }, { headers: authHeader() }),
};
