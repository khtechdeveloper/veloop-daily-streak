import React from "react";
import styles from "./StreakLoader.module.css";
import { Flame } from "lucide-react";

export default function StreakLoader() {
  return (
    <div className={styles.wrap}>
      <div className={styles.badge}>
        <Flame size={40} color="var(--vl-gold)" />
      </div>
      <p className={styles.text}>Loading your streak…</p>
    </div>
  );
}
