import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DailyStreakPage from "./pages/DailyStreak/DailyStreakPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/daily-streak"
        element={
          <ProtectedRoute>
            <DailyStreakPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/daily-streak" replace />} />
    </Routes>
  );
}
