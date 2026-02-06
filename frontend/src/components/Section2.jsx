import styles from "./Section2.module.css";

export default function Section2() {
  const features = [
    {
      icon: "👤",
      iconClass: styles.iconBlue,
      title: "Personalized career roadmap",
      description: "Get a custom plan tailored to your skills, goals, and timeline. No generic advice."
    },
    {
      icon: "↗️",
      iconClass: styles.iconPurple,
      title: "Interactive zoomable canvas",
      description: "Zoom in on details or see the big picture. Drag, drop, and rearrange your path."
    },
    {
      icon: "📈",
      iconClass: styles.iconGreen,
      title: "Career assessment & scoring",
      description: "Understand your strengths and gaps with our smart assessment. Get a clear score."
    },
    {
      icon: "📋",
      iconClass: styles.iconOrange,
      title: "Progress tracking",
      description: "See how far you've come. Celebrate milestones and stay motivated every day."
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Everything you need to grow</h2>
      <div className={styles.grid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.card}>
            <div className={`${styles.iconWrapper} ${feature.iconClass}`}>
              {feature.icon}
            </div>
            <div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
