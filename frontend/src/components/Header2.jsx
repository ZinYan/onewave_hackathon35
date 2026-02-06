import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header2 = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.header} style={{ background: "transparent", border: "none", borderBottom: "none" }}>
      <div className={styles.container} style={{ display: "flex", justifyContent: "flex-start" }}>
        <div className={styles.container2} onClick={() => navigate("/onboarding")} style={{ cursor: "pointer" }}>
          <div className={styles.container3}>A</div>
          <div className={styles.container4}>
            <b className={styles.careerpath}>CareerPath</b>
          </div>
        </div>
        {/* <div className={styles.actions}>
          <div className={styles.button2}>
            <div className={styles.login}>Go to RoadMap</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Header2;
