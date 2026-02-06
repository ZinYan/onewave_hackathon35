import { useState } from "react";
import Header from "../components/Header";

export default function Next() {
  const [interest, setInterest] = useState("");

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "white", fontFamily: "Pretendard, system-ui, -apple-system, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div style={{ flex: 1, width: "100%", padding: "20px 24px", display: "flex", justifyContent: "center", alignItems: "center", overflow: "auto", boxSizing: "border-box" }}>
        <div style={{ width: "100%", maxWidth: 672 }}>
          {/* Icon and Title */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, background: "#F3F4F6", borderRadius: 12, marginBottom: 16 }} />
            <div style={{ textAlign: "center", color: "#101828", fontSize: 28, fontWeight: "700", lineHeight: 1.2, marginBottom: 8 }}>
              We will find the best job for you
            </div>
            <div style={{ textAlign: "center", color: "#364153", fontSize: 15, fontWeight: "400", lineHeight: 1.4 }}>
              Let's start by understanding your interests and skills.
            </div>
          </div>

          {/* Input Card */}
          <div style={{ width: "100%", padding: "20px", background: "white", boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)", borderRadius: 12, border: "1px solid #1E2939", marginBottom: 16, boxSizing: "border-box" }}>
            <div style={{ color: "#101828", fontSize: 15, fontWeight: "500", lineHeight: 1.4, marginBottom: 10 }}>
              What area are you most interested in?
            </div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6A7282", fontSize: 14 }}>🔍</div>
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g., Technology, Design, Business, Healthcare..."
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  background: "white",
                  borderRadius: 8,
                  border: "1px solid #364153",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ color: "#4A5565", fontSize: 12, fontWeight: "400", lineHeight: 1.4 }}>
              Type any field that excites you. We'll match it with suitable roles.
            </div>
          </div>

          {/* Next Button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              style={{
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
              }}
            >
              <span style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Next Step</span>
              <span style={{ color: "white", fontSize: 14 }}>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ width: "100%", paddingLeft: 32, paddingRight: 32, paddingTop: 16, paddingBottom: 16, borderTop: "1px solid #101828", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#364153", fontSize: 14 }}>ℹ️</span>
          <span style={{ color: "#364153", fontSize: 13, fontWeight: "400" }}>Need help? Contact support</span>
        </div>
        <div style={{ color: "#364153", fontSize: 13, fontWeight: "400" }}>
          © 2025 CareerPath. All journeys are personal.
        </div>
      </div>
    </div>
  );
}
