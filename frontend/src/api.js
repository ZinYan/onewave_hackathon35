// src/api.js
const BASE_URL = "http://127.0.0.1:8000/api";

export function setTokens({ access, refresh }) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
}
export function getAccessToken() {
  return localStorage.getItem("access");
}
export function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.detail || data?.message || JSON.stringify(data);
    throw new Error(msg);
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup/", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login/", { method: "POST", body: payload }),
  me: () => request("/users/me/", { auth: true }),
  onboarding: (payload) => request("/users/me/onboarding/", { method: "PATCH", body: payload, auth: true }),
};
