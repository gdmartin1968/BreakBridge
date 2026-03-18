// Base fetch utility for typed responses
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'omit', // In dev, we use passthrough
  });

  if (!res.ok) {
    let message = 'An error occurred';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch (e) {
      message = res.statusText;
    }
    throw new Error(message);
  }

  // Handle empty responses
  if (res.status === 204) return {} as T;
  
  return res.json();
}
