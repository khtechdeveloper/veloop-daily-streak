import React from "react";
import styles from "./StreakSkeleton.module.css";

export default function StreakSkeleton() {
  return (
    <div className={styles.container}>
      <div className={`${styles.block} ${styles.header}`} />
      <div className={`${styles.block} ${styles.hero}`} />
      <div className={styles.statsRow}>
        <div className={`${styles.block} ${styles.stat}`} />
        <div className={`${styles.block} ${styles.stat}`} />
        <div className={`${styles.block} ${styles.stat}`} />
      </div>
      <div className={`${styles.block} ${styles.ultimate}`} />
      <div className={styles.grid}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.card}`} />
        ))}
      </div>
    </div>
  );
}
