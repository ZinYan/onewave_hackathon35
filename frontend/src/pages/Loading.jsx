// Styles
const styles = {
  container: {
    width: "100%",
    height: "100vh",
    paddingTop: 200,
    paddingBottom: 200,
    background: "linear-gradient(0deg, black 0%, black 100%), white",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontFamily: "Pretendard, system-ui, -apple-system, sans-serif",
    boxSizing: "border-box"
  },
  spinnerWrapper: {
    paddingBottom: 40,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    display: "flex"
  },
  spinner: {
    width: 100,
    height: 100,
    borderRadius: 9999,
    border: "4px solid white",
    borderTopColor: "transparent",
    animation: "spin 1s linear infinite"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 12,
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
    color: "white",
    fontSize: 36,
    fontWeight: "700",
    lineHeight: "40px"
  },
  subtitleWrapper: {
    alignSelf: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex"
  },
  subtitle: {
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    color: "#D1D5DC",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: "24px"
  },
  
};

export default function Loading() {
  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Spinner */}
      <div style={styles.spinnerWrapper}>
        <div style={styles.spinner} />
      </div>

      {/* Text */}
      <div style={styles.textWrapper}>
        <div style={styles.titleWrapper}>
          <div style={styles.title}>로딩 중</div>
        </div>
        <div style={styles.subtitleWrapper}>
          <div style={styles.subtitle}>잠시만 기다려 주세요...</div>
        </div>
      </div>

     
    </div>
  );
}
