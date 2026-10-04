import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      navigate("/daily-streak");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--vl-card)",
          border: "1px solid var(--vl-card-border)",
          borderRadius: "var(--vl-radius)",
          padding: 32,
          width: "100%",
          maxWidth: 380,
        }}
      >
        <h2 style={{ color: "var(--vl-gold-light)", marginBottom: 4 }}>VELoop Rewards</h2>
        <p style={{ color: "var(--vl-text-muted)", marginBottom: 24 }}>
          {mode === "login" ? "Log in to view your streak" : "Create an account to start your streak"}
        </p>

        {mode === "register" && (
          <input
            className="form-control mb-3"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="form-control mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div style={{ color: "#f87171", marginBottom: 12, fontSize: 14 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn w-100"
          style={{ background: "var(--vl-gold)", color: "#241300", fontWeight: 700 }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="btn btn-link w-100 mt-2"
          style={{ color: "var(--vl-purple-light)" }}
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
