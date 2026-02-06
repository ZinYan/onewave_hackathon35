import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header2 from "../components/Header2";

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
  },
  loading: {
    textAlign: "center",
    color: "#6A7282",
    fontSize: 16,
    padding: "40px 0"
  },
  error: {
    textAlign: "center",
    color: "#DC2626",
    fontSize: 16,
    padding: "40px 0"
  }
};

export default function Score() {
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // API에서 점수 데이터 가져오기
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(null);

        // Phase 2-1: 기업 인재상 생성 (백엔드에서 자동 처리)
        const phase1Response = await fetch('/api/onboarding/score/1/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!phase1Response.ok) {
          throw new Error('Failed to generate company profile');
        }

        // Phase 2-2: 백엔드에서 계산된 점수 가져오기
        const phase2Response = await fetch('/api/onboarding/score/2/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!phase2Response.ok) {
          throw new Error('Failed to fetch score');
        }

        const data = await phase2Response.json();
        
        // API 응답에서 점수와 직업 정보 설정
        setScore(data.score || 0);
        setJobTitle(data.job_title || "Product Manager");
        
      } catch (err) {
        console.error('Error fetching score:', err);
        setError(err.message);
        // 에러 발생 시 기본값 사용
        setScore(40);
        setJobTitle("Product Manager");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  // 점수에 따른 설명 메시지 생성
  const getScoreDescription = (score) => {
    if (score >= 80) {
      return "Excellent! You're well-prepared for this role.\nKeep building on your strong foundation.";
    } else if (score >= 60) {
      return "Great start! You have a solid foundation to build\nupon. Let's create a personalized plan to reach\nyour career goals.";
    } else if (score >= 40) {
      return "Good beginning! There's room to grow.\nLet's identify key areas to focus on for your\ncareer development.";
    } else {
      return "Starting your journey! We'll create a clear path\nto help you build the skills needed for your\ntarget role.";
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Header2 />
        <div style={styles.container}>
          <div style={styles.loading}>Loading your score...</div>
        </div>
      </div>
    );
  }

  if (error && score === null) {
    return (
      <div style={styles.page}>
        <Header2 />
        <div style={styles.container}>
          <div style={styles.error}>
            Error loading score. Please try again.
            <br />
            <button 
              style={{ ...styles.button, marginTop: 20, width: 'auto' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header2 />
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
                {getScoreDescription(score).split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < getScoreDescription(score).split('\n').length - 1 && <br />}
                  </span>
                ))}
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