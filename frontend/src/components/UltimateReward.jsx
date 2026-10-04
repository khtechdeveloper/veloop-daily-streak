import React from "react";
import { Crown, Lock, Unlock } from "lucide-react";
import styles from "./UltimateReward.module.css";

export default function UltimateReward({ reward, unlocked }) {
  if (!reward) return null;
  return (
    <section className={styles.wrap}>
      <div className={styles.crownWrap}>
        <Crown size={64} color="var(--vl-gold)" />
      </div>
      <div className={styles.info}>
        <div className={styles.label}>Ultimate Reward</div>
        <div className={styles.amount}>
          {reward.currency === "INR" ? "₹" : ""}
          {reward.amount}
        </div>
        <div className={styles.subtitle}>{reward.subtitle}</div>
      </div>
      <div className={styles.unlockBadge}>
        {unlocked ? <Unlock size={16} color="var(--vl-green)" /> : <Lock size={16} color="var(--vl-text-muted)" />}
        <span>{unlocked ? "Unlocked" : `Unlock on Day ${reward.day}`}</span>
      </div>
    </section>
  );
}
