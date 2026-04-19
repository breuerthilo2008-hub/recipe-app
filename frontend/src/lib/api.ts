// frontend/src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    // Required for sending/receiving httpOnly cookies
    credentials: 'include',
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses or file streams
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response;
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) => 
    request(path, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined) 
    }),
  put: (path: string, body?: any, options?: RequestInit) => 
    request(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any, options?: RequestInit) => 
    request(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
