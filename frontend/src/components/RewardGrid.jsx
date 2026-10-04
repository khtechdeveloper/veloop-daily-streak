import React from "react";
import RewardCard from "./RewardCard.jsx";
import styles from "./RewardGrid.module.css";

export default function RewardGrid({ rewards, onClaim, onTimerComplete, claiming }) {
  return (
    <section className={styles.grid}>
      {rewards.map((dayData) => (
        <RewardCard
          key={dayData.day}
          dayData={dayData}
          onClaim={() => onClaim(dayData.day)}
          onTimerComplete={onTimerComplete}
          claiming={claiming}
        />
      ))}
    </section>
  );
}
