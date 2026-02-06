import { useEffect, useState } from "react";
import { api, clearTokens } from "../api";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ major: "", interest_field: "", target_period_months: 12 });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.me();
        setMe(data);

        const p = data.profile || {};
        setForm({
          major: p.major || "",
          interest_field: p.interest_field || "",
          target_period_months: p.target_period_months ?? 12,
        });

        // If already completed → go to next feature (Q&A session)
        if (p.onboarding_completed) {
          nav("/next"); // you can change this route later
        }
      } catch (e2) {
        clearTokens();
        nav("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const result = await api.onboarding({
        ...form,
        target_period_months: Number(form.target_period_months),
      });
      if (result.onboarding_completed) {
        nav("/next"); // later: your Q&A flow screen
      }
    } catch (e2) {
      setErr(e2.message);
    }
  };

  if (loading) return <div style={{ margin: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Onboarding</h2>
      {me && <p style={{ opacity: 0.7 }}>Hello, {me.username}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Major
          <input value={form.major}
            onChange={(e) => setForm({ ...form, major: e.target.value })}
            placeholder="e.g., Software Engineering" />
        </label>

        <label>
          Interest field
          <input value={form.interest_field}
            onChange={(e) => setForm({ ...form, interest_field: e.target.value })}
            placeholder="e.g., AI/BigData" />
        </label>

        <label>
          Target period (months)
          <select value={form.target_period_months}
            onChange={(e) => setForm({ ...form, target_period_months: e.target.value })}>
            {[3,6,12,18,24].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>

        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Save & Continue</button>
      </form>

      <button
        onClick={() => { clearTokens(); nav("/login"); }}
        style={{ marginTop: 16 }}
      >
        Logout
      </button>
    </div>
  );
}
