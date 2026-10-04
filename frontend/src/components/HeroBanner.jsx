import React from "react";
import { CalendarCheck } from "lucide-react";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <div className={styles.iconWrap}>
        <CalendarCheck size={44} color="var(--vl-purple-light)" />
      </div>
      <div>
        <h2 className={styles.title}>
          Login Daily &amp; Earn <span className={styles.gold}>Bigger Rewards!</span>
        </h2>
        <p className={styles.subtitle}>
          Maintain your streak and unlock <span className={styles.purpleText}>exciting rewards</span> every day.
        </p>
      </div>
    </section>
  );
}
