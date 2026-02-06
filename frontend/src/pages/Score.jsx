import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// Styles
const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "white",
    fontFamily: "Pretendard, system-ui, -apple-system, sans-serif"
  },
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    boxSizing: "border-box"
  },
  card: {
    width: 360,
    padding: 28,
    background: "white",
    boxShadow: "0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)",
    overflow: "hidden",
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 20,
    display: "inline-flex"
  },
  header: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
    display: "flex"
  },
  titleWrapper: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex"
  },
  title: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#101828",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: "32px",
    wordWrap: "break-word"
  },
  subtitleWrapper: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex"
  },
  subtitleText: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column"
  },
  subtitleNormal: { color: "#4A5565", fontSize: 14, fontWeight: "400", lineHeight: "22px" },
  subtitleBold: { color: "#101828", fontSize: 14, fontWeight: "600", lineHeight: "22px" },
  scoreSection: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
    display: "flex"
  },
  scoreWrapper: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex"
  },
  scoreNumber: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#101828",
    fontSize: 64,
    fontWeight: "900",
    lineHeight: "64px"
  },
  scoreLabel: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#6A7282",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: "24px"
  },
  progressSection: {
    alignSelf: "stretch",
    height: 120,
    position: "relative"
  },
  description: {
    width: "100%",
    left: 0,
    top: 0,
    position: "absolute",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "inline-flex"
  },
  descriptionText: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#364153",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "22px"
  },
  progressBar: {
    width: "100%",
    height: 6,
    left: 0,
    top: 80,
    position: "absolute",
    background: "#E5E7EB",
    overflow: "hidden",
    borderRadius: 9999
  },
  progressFill: {
    width: "40%",
    height: 6,
    left: 0,
    top: 0,
    position: "absolute",
    background: "#101828",
    borderRadius: 9999
  },
  progressLabels: {
    width: "100%",
    left: 0,
    top: 94,
    position: "absolute",
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "inline-flex"
  },
  progressLabel: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "inline-flex"
  },
  progressLabelText: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#6A7282",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  },
  footer: {
    alignSelf: "stretch",
    paddingTop: 4,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
    display: "flex"
  },
  button: {
    alignSelf: "stretch",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    background: "#101828",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    display: "inline-flex",
    border: "none",
    cursor: "pointer"
  },
  buttonText: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: "28px"
  },
  footerHint: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex"
  },
  footerHintText: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#6A7282",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: "20px"
  }
};

export default function Score() {
  const navigate = useNavigate();
  const score = 40; // TODO: 실제 점수로 교체
  const jobTitle = "Product Manager"; // TODO: 실제 직업으로 교체

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleWrapper}>
            <div style={styles.title}>Score Result</div>
          </div>
          <div style={styles.subtitleWrapper}>
            <div style={styles.subtitleText}>
              <span style={styles.subtitleNormal}>Your score for </span>
              <span style={styles.subtitleBold}>{jobTitle}</span>
              <span style={styles.subtitleNormal}> is</span>
            </div>
          </div>
        </div>

        {/* Score */}
        <div style={styles.scoreSection}>
          <div style={styles.scoreWrapper}>
            <div style={styles.scoreNumber}>{score}</div>
          </div>
          <div style={styles.scoreWrapper}>
            <div style={styles.scoreLabel}>points</div>
          </div>
        </div>

        {/* Progress */}
        <div style={styles.progressSection}>
          <div style={styles.description}>
            <div style={styles.descriptionText}>
              Great start! You have a solid foundation to build<br />
              upon. Let's create a personalized plan to reach<br />
              your career goals.
            </div>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${score}%` }} />
          </div>
          <div style={styles.progressLabels}>
            <div style={styles.progressLabel}>
              <div style={styles.progressLabelText}>0</div>
            </div>
            <div style={styles.progressLabel}>
              <div style={styles.progressLabelText}>100</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.button} onClick={() => navigate("/roadmap")}>
            <div style={styles.buttonText}>View my roadmap</div>
          </button>
          <div style={styles.footerHint}>
            <div style={styles.footerHintText}>Your detailed report and next steps are ready.</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
