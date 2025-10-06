import { LoginCredentials, LoginResponse } from '../contexts/AuthContext';

const API_URL = 'http://localhost:4000/api';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    // Return the user data along with the success status
    return { success: true, user: data.user };
  } else {
    const errorData = await response.json();
    return { success: false, error: errorData.message || 'Login failed' };
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('authToken');
  return Promise.resolve();
};
