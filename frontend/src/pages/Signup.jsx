import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.signup(form);
      nav("/login");
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Sign up</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="email (optional)" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Create account</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
