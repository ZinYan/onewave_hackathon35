import { useState } from "react";
import { api, setTokens } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const data = await api.login(form); // {access, refresh}
      setTokens(data);
      nav("/onboarding");
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 12 }}>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
