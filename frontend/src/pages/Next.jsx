import { useState } from "react";
import Header2 from "../components/Header2";

// Styles
const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "white",
    fontFamily: "Pretendard, system-ui, -apple-system, sans-serif",
    overflow: "hidden"
  },
  stepProgress: {
    width: "100%",
    padding: "30px 32px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    boxSizing: "border-box"
  },
  stepText: { color: "#364153", fontSize: 14, fontWeight: "400" },
  progressBar: { width: 128, height: 8, background: "#D1D5DC", borderRadius: 9999, overflow: "hidden" },
  progressFill: { width: "20%", height: "100%", background: "#101828", borderRadius: 9999 },
  main: {
    flex: 1,
    width: "100%",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "auto",
    boxSizing: "border-box"
  },
  content: { width: "100%", maxWidth: 672 },
  titleSection: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 },
  icon: { width: 48, height: 48, background: "#F3F4F6", borderRadius: 12, marginBottom: 16 },
  title: { textAlign: "center", color: "#101828", fontSize: 28, fontWeight: "700", lineHeight: 1.2, marginBottom: 8 },
  subtitle: { textAlign: "center", color: "#364153", fontSize: 15, fontWeight: "400", lineHeight: 1.4 },
  card: {
    width: "100%",
    padding: "20px",
    background: "white",
    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)",
    borderRadius: 12,
    border: "1px solid #1E2939",
    marginBottom: 16,
    boxSizing: "border-box"
  },
  cardLabel: { color: "#101828", fontSize: 15, fontWeight: "500", lineHeight: 1.4, marginBottom: 10 },
  inputWrapper: { position: "relative", marginBottom: 8 },
  inputIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6A7282", fontSize: 14 },
  input: {
    width: "100%",
    padding: "12px 12px 12px 38px",
    background: "white",
    borderRadius: 8,
    border: "1px solid #364153",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box"
  },
  cardHint: { color: "#4A5565", fontSize: 12, fontWeight: "400", lineHeight: 1.4 },
  buttonWrapper: { display: "flex", justifyContent: "flex-end" },
  button: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    background: "#101828",
    borderRadius: 8,
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer"
  },
  buttonText: { color: "white", fontSize: 14, fontWeight: "500" },
  buttonArrow: { color: "white", fontSize: 14 },
  footer: {
    width: "100%",
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 16,
    paddingBottom: 16,
    borderTop: "1px solid #101828",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
    boxSizing: "border-box"
  },
  footerLeft: { display: "flex", alignItems: "center", gap: 8 },
  footerIcon: { color: "#364153", fontSize: 14 },
  footerText: { color: "#364153", fontSize: 13, fontWeight: "400" }
};

export default function Next() {
  const [interest, setInterest] = useState("");

  return (
    <div style={styles.container}>
      <Header2 />

      {/* Step Progress */}
      <div style={styles.stepProgress}>
        <span style={styles.stepText}>Step 1 of 5</span>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.content}>
          <div style={styles.titleSection}>
            <div style={styles.icon} />
            <div style={styles.title}>We will find the best job for you</div>
            <div style={styles.subtitle}>Let's start by understanding your interests and skills.</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>What area are you most interested in?</div>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>🔍</div>
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g., Technology, Design, Business, Healthcare..."
                style={styles.input}
              />
            </div>
            <div style={styles.cardHint}>Type any field that excites you. We'll match it with suitable roles.</div>
          </div>

          <div style={styles.buttonWrapper}>
            <button style={styles.button}>
              <span style={styles.buttonText}>Next Step</span>
              <span style={styles.buttonArrow}>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          <span style={styles.footerIcon}>ℹ️</span>
          <span style={styles.footerText}>Need help? Contact support</span>
        </div>
        <div style={styles.footerText}>© 2025 CareerPath. All journeys are personal.</div>
      </div>
    </div>
  );
}
