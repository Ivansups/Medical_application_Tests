import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Test {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  duration_minutes: number;
}

export interface TestCreate {
  title: string;
  description?: string;
}

export interface TestUpdate {
  title: string;
  description?: string;
}

export const testsApi = {
  getAll: async (skip: number = 0, limit: number = 10): Promise<Test[]> => {
    const response = await api.get(`/api/v1/tests_all_tests?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (testId: string): Promise<Test> => {
    const response = await api.get(`/api/v1/tests/${testId}`);
    return response.data;
  },

  create: async (test: TestCreate): Promise<Test> => {
    const response = await api.post('/api/v1/tests', test);
    return response.data;
  },

  update: async (testId: string, test: TestUpdate): Promise<Test> => {
    const response = await api.put(`/api/v1/tests/${testId}`, test);
    return response.data;
  },

  delete: async (testId: string): Promise<void> => {
    await api.delete(`/api/v1/tests/${testId}`);
  },
};

export default api;