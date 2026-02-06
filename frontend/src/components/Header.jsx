import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.container2} onClick={() => navigate("/onboarding")} style={{ cursor: "pointer" }}>
          <div className={styles.container3}>A</div>
          <div className={styles.container4}>
            <b className={styles.careerpath}>CareerPath</b>
          </div>
        </div>
        <div className={styles.nav}>
          <div className={styles.link} onClick={() => scrollToSection("features")} style={{ cursor: "pointer" }}>Features</div>
          <div className={styles.link} onClick={() => scrollToSection("how-it-works")} style={{ cursor: "pointer" }}>How it works</div>
          <div className={styles.link} onClick={() => scrollToSection("pricing")} style={{ cursor: "pointer" }}>Pricing</div>
        </div>
        <div className={styles.actions}>
          <div className={styles.button2}>
            <div className={styles.login}>Get started</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
