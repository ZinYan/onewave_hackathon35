import styles from "./Header.module.css";

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.container2}>
          <div className={styles.container3}>A</div>
          <div className={styles.container4}>
            <b className={styles.careerpath}>CareerPath</b>
          </div>
        </div>
        <div className={styles.nav}>
          <div className={styles.link}>Features</div>
          <div className={styles.link}>How it works</div>
          <div className={styles.link}>Pricing</div>
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
