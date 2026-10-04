import React, { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, registerRequest } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("veloop_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("veloop_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("veloop_token", token);
    else localStorage.removeItem("veloop_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("veloop_user", JSON.stringify(user));
    else localStorage.removeItem("veloop_user");
  }, [user]);

  async function login(email, password) {
    const data = await loginRequest(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password) {
    const data = await registerRequest(name, email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
