import { supabase, supabaseClientError } from './supabaseClient';

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return '';
  }
  return envUrl.replace(/\/$/, '');
};

const API_BASE = resolveBaseUrl();

const buildUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (API_BASE) {
    const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${sanitizedPath}`;
  }
  return path;
};

const getAuthHeaders = async () => {
  if (!supabase) {
    if (supabaseClientError) {
      console.warn('Supabase auth unavailable:', supabaseClientError.message);
    }
    return {};
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
};

const safeReadError = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message;
    }
    return JSON.stringify(data);
  } catch (error) {
    return undefined;
  }
};

interface RequestOptions extends RequestInit {
  parseJson?: boolean;
}

export const apiClient = {
  async get<T = unknown>(path: string, options: RequestOptions = {}) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    if (options.parseJson === false) {
      return undefined as T;
    }

    return (await response.json()) as T;
  },

  async post<T = unknown>(path: string, body: unknown, options: RequestOptions = {}) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const message = await safeReadError(response);
      throw new Error(message ?? `Request failed: ${response.status}`);
    }

    if (options.parseJson === false) {
      return undefined as T;
    }

    return (await response.json()) as T;
  },

  async patch<T = unknown>(path: string, body: unknown, options: RequestOptions = {}) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const message = await safeReadError(response);
      throw new Error(message ?? `Request failed: ${response.status}`);
    }

    if (options.parseJson === false) {
      return undefined as T;
    }

    return (await response.json()) as T;
  },

  async delete(path: string, options: RequestOptions = {}) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      const message = await safeReadError(response);
      throw new Error(message ?? `Request failed: ${response.status}`);
    }
  },
};
