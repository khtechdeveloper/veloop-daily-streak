import apiClient from "./apiClient";

/**
 * Centralized API layer for the Daily Streak feature. Components never call
 * axios directly - they call these functions, which always send the
 * minimal request and always let the backend response (not local guesses)
 * decide the next UI state.
 */

export async function getStreak() {
  const { data } = await apiClient.get("/daily-streak");
  return data;
}

export async function getStatus() {
  const { data } = await apiClient.get("/daily-streak/status");
  return data;
}

// Deliberately sends an empty body. The backend derives the eligible day
// from the authenticated user's own stored streak state - it never trusts
// a client-supplied day/reward/amount/currency/userId.
export async function claimStreak() {
  const { data } = await apiClient.post("/daily-streak/claim", {});
  return data;
}

export async function getHistory() {
  const { data } = await apiClient.get("/daily-streak/history");
  return data;
}

export async function getWallet() {
  const { data } = await apiClient.get("/daily-streak/wallet");
  return data;
}
