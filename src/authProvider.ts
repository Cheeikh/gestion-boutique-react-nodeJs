import { AuthBindings } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthBindings = {
  login: async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: new Error(data.error),
        };
      }

      localStorage.setItem('studentId', data.user.studentId);
      localStorage.setItem(TOKEN_KEY, JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: data.redirectTo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('studentId');
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const studentId = localStorage.getItem('studentId');
    if (token && studentId) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: new Error("Not authenticated"),
      logout: true,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const user = JSON.parse(token);
      return user.role;
    }
    return null;
  },

  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const user = JSON.parse(token);
      return {
        id: user.id,
        name: user.username,
        avatar: "https://i.pravatar.cc/300",
        role: user.role,
      };
    }
    return null;
  },

  onError: async (error) => {
    console.error("Auth provider error:", error);
    return { error };
  },
};