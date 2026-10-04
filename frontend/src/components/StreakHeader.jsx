import React from "react";
import { ChevronLeft, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./StreakHeader.module.css";

export default function StreakHeader({ gemBalance = 0 }) {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
        <ChevronLeft size={20} />
      </button>
      <h1 className={styles.title}>
        Daily Streak <span className={styles.fire}>🔥</span>
      </h1>
      <div className={styles.balance}>
        <Gem size={16} color="var(--vl-purple-light)" />
        <span>{gemBalance}</span>
      </div>
    </header>
  );
}
