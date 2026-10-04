import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import styles from "./CpaDemo.module.css";

/**
 * Polished placeholder for where a real CPA/ad network will later be
 * integrated. It is purely presentational - it never grants the reward
 * itself. The parent (DailyStreakPage) is the one that actually calls
 * POST /claim and waits for the backend's response; this component just
 * fills the visual "processing" gap described in the design (spec #7/#68).
 */
export default function CpaDemo({ onFinished, minDurationMs = 1800 }) {
  const [message, setMessage] = useState("Preparing your reward…");

  useEffect(() => {
    const t1 = setTimeout(() => setMessage("Advertisement / Reward Verification"), 700);
    const t2 = setTimeout(() => setMessage("Please wait…"), 1300);
    const t3 = setTimeout(() => onFinished && onFinished(), minDurationMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [minDurationMs, onFinished]);

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <ShieldCheck size={26} color="var(--vl-purple-light)" />
        <p className={styles.message}>{message}</p>
        <p className={styles.hint}>Your reward is confirmed by our servers, not this screen.</p>
      </div>
    </div>
  );
}
