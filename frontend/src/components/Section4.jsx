import { useNavigate } from "react-router-dom";
import styles from "./Section4.module.css";

export default function Section4() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Ready to build your future?</h2>
      <p className={styles.description}>
        Join thousands who've turned career dreams into reality. Your roadmap is waiting.
      </p>
      <button className={styles.button} onClick={() => navigate("/next")}>
        Check the plan
      </button>
      <p className={styles.note}>No credit card required • 14-day free trial</p>
    </section>
  );
}
