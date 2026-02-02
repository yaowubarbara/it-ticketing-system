import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',  // 会被代理到 http://localhost:8000/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 工单API
export const ticketAPI = {
  // 获取所有工单
  getTickets: (params) => api.get('/tickets/', { params }),
  
  // 获取单个工单详情
  getTicket: (id) => api.get(`/tickets/${id}/`),
  
  // 创建工单
  createTicket: (data) => api.post('/tickets/', data),
  
  // 更新工单
  updateTicket: (id, data) => api.patch(`/tickets/${id}/`, data),
  
  // 分配工单
  assignTicket: (id, data) => api.post(`/tickets/${id}/assign/`, data),
  
  // 解决工单
  resolveTicket: (id, data) => api.post(`/tickets/${id}/resolve/`, data),
  
  // 关闭工单
  closeTicket: (id, data) => api.post(`/tickets/${id}/close/`, data),
};

// 员工API
export const employeeAPI = {
  getEmployees: () => api.get('/employees/'),
  getEmployee: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post('/employees/', data),
};

// 知识库API
export const knowledgeAPI = {
  getKnowledgeBase: (params) => api.get('/knowledge-base/', { params }),
  getKnowledge: (id) => api.get(`/knowledge-base/${id}/`),
  createKnowledge: (data) => api.post('/knowledge-base/', data),
  updateKnowledge: (id, data) => api.put(`/knowledge-base/${id}/`, data),
  deleteKnowledge: (id) => api.delete(`/knowledge-base/${id}/`),
};

export default api;