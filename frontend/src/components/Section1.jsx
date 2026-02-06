import { useNavigate } from "react-router-dom";
import styles from "./Section1.module.css";

export default function Section1() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className={styles.textBlock}>
        <div className={styles.heading1}>
          <b className={styles.yourCareerMapped}>Your career, mapped out</b>
        </div>
        <div className={styles.descriptionWrapper}>
          <p className={styles.buildAPersonalized}>
            Build a personalized, step‑by‑step roadmap to reach your
            <br />
            dream job. No guesswork, just clarity.
          </p>
        </div>
        <button className={styles.button} onClick={() => navigate("/next")}>
          <span className={styles.getStarted}>Get started</span>
        </button>
      </div>

      <div className={styles.overlayshadow}>
        <div className={styles.previewCard}>
          <div className={styles.previewBody}>
            <div className={styles.previewChartPlaceholder} />
          </div>
        </div>
      </div>
    </section>
  );
}
