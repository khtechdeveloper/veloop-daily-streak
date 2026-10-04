import React from "react";
import { Activity, TrendingUp, Gift, ShieldAlert } from "lucide-react";
import styles from "./WhyStreak.module.css";

const ITEMS = [
  { icon: Activity, title: "Stay Active", desc: "Keep your streak alive & earn more!" },
  { icon: TrendingUp, title: "Bigger Streak", desc: "More consecutive logins, bigger rewards!" },
  { icon: Gift, title: "Exclusive Rewards", desc: "Get coins, gift cards & special bonuses." },
  { icon: ShieldAlert, title: "Don't Miss Out", desc: "Come back every day & unlock all rewards!" },
];

export default function WhyStreak() {
  return (
    <section className={styles.wrap}>
      <h3 className={styles.heading}>✦ Why Maintain Your Streak? ✦</h3>
      <div className={styles.grid}>
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className={styles.item}>
            <Icon size={20} color="var(--vl-purple-light)" />
            <div>
              <div className={styles.itemTitle}>{title}</div>
              <div className={styles.itemDesc}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
