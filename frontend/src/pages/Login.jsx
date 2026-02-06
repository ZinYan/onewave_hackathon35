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
      const data = await api.login(form); // { access, refresh }
      setTokens(data);
      nav("/onboarding");
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Log in to continue your journey</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {err && <div style={styles.error}>{err}</div>}

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.footer}>
          No account yet?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui",
  },
  card: {
    width: 420,
    background: "#fff",
    borderRadius: 16,
    padding: "36px 32px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  },
  title: {
    margin: 0,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 700,
    color: "#0d47a1",
  },
  subtitle: {
    margin: 0,
    marginBottom: 24,
    fontSize: 14,
    color: "#546e7a",
  },
  form: {
    display: "grid",
    gap: 14,
  },
  input: {
    padding: "12px 14px",
    fontSize: 14,
    borderRadius: 10,
    border: "1px solid #cfd8dc",
    outline: "none",
  },
  button: {
    marginTop: 8,
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #1e88e5, #1565c0)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#d32f2f",
    fontSize: 13,
  },
  footer: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#455a64",
  },
  link: {
    color: "#1565c0",
    fontWeight: 600,
    textDecoration: "none",
  },
};
