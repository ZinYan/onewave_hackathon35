import styles from "./Section3.module.css";

export default function Section3() {
  const steps = [
    {
      number: "1",
      colorClass: styles.stepBlue,
      title: "Choose your job",
      description: "Pick your target role from hundreds of real‑world career paths."
    },
    {
      number: "2",
      colorClass: styles.stepPurple,
      title: "Take assessment",
      description: "Answer a few questions about your skills and experience."
    },
    {
      number: "3",
      colorClass: styles.stepGreen,
      title: "Get your roadmap",
      description: "Receive a detailed, personalized roadmap with milestones and resources."
    },
    {
      number: "4",
      colorClass: styles.stepOrange,
      title: "Track progress",
      description: "Check off tasks, update your status, and watch your career grow."
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>How it works</h2>
      <div className={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={`${styles.stepNumber} ${step.colorClass}`}>
              {step.number}
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}