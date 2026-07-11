import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
    }
  }, [user]);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    const userData = response.data?.user || { email: credentials.email };
    const token = response.data?.token;

    if (token) {
      localStorage.setItem("authToken", token);
    }

    setUser(userData);
    return response;
  }

  function logout() {
    setUser(null);
    navigate("/login");
  }

  function updateUser(newData) {
    setUser((prev) => (prev ? { ...prev, ...newData } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
