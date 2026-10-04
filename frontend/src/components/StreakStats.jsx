import React from "react";
import { CalendarDays, CheckSquare, Star } from "lucide-react";
import styles from "./StreakStats.module.css";

export default function StreakStats({ totalRewards, checkedIn, nextReward }) {
  return (
    <section className={styles.row}>
      <div className={styles.stat}>
        <CalendarDays size={18} color="var(--vl-purple-light)" />
        <div>
          <div className={styles.label}>Total Rewards</div>
          <div className={styles.value}>{totalRewards}</div>
        </div>
      </div>

      <div className={styles.stat}>
        <CheckSquare size={18} color="var(--vl-green)" />
        <div>
          <div className={styles.label}>Checked In</div>
          <div className={styles.value}>{checkedIn}</div>
        </div>
      </div>

      <div className={styles.stat}>
        <Star size={18} color="var(--vl-gold)" />
        <div>
          <div className={styles.label}>Next Reward</div>
          <div className={styles.value}>
            {nextReward ? `+${nextReward.amount} ${nextReward.currency === "INR" ? "₹" : nextReward.currency}` : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}
