import { getCookie } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

const apiClient = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return apiClient.request<T>("GET", endpoint, undefined, options);
  },
  
  post: async <T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> => {
    return apiClient.request<T>("POST", endpoint, body, options);
  },
  
  request: async <T>(
    method: string,
    endpoint: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers = {
      "Content-Type": "application/json",
    } as Record<string, string>;

    const token = getCookie("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (response.status === 401) {
      document.cookie = "access_token=; Max-Age=0; path=/";
      window.location.href = "/auth/signin";
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "HTTP error");
    }

    return data;
  },
};

export default apiClient;