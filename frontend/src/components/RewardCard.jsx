import React from "react";
import { Lock, Check, Gift, Coins, Crown } from "lucide-react";
import styles from "./RewardCard.module.css";
import { useCountdown } from "../hooks/useCountdown.js";

const ASSET_ICON = {
  coin: Coins,
  "gift-card": Gift,
  crown: Crown,
};

export default function RewardCard({ dayData, onClaim, onTimerComplete, claiming }) {
  const { day, status, reward, isToday, nextClaimAt } = dayData;
  const Icon = ASSET_ICON[reward.assetType] || Coins;

  const { formatted } = useCountdown(status === "LOCKED" && isToday ? nextClaimAt : null, () => {
    if (isToday) onTimerComplete && onTimerComplete();
  });

  const cardClass = [
    styles.card,
    status === "CLAIMED" && styles.claimed,
    isToday && status === "AVAILABLE" && styles.today,
    day === 7 && styles.ultimate,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      {isToday && status === "AVAILABLE" && <span className={styles.badge}>Today</span>}
      {day === 7 && <span className={`${styles.badge} ${styles.vip}`}>VIP</span>}

      <div className={styles.dayLabel}>Day {day}</div>

      <div className={styles.iconWrap}>
        <Icon size={30} color={status === "CLAIMED" ? "var(--vl-green)" : "var(--vl-gold)"} />
      </div>

      <div className={styles.rewardTitle}>{reward.title}</div>
      <div className={styles.rewardAmount}>
        {reward.currency === "INR" ? "₹" : "+"}
        {reward.amount}
      </div>
      <div className={styles.rewardSubtitle}>{reward.subtitle}</div>

      {status === "CLAIMED" && (
        <div className={styles.claimedTag}>
          <Check size={14} /> Claimed
        </div>
      )}

      {status === "LOCKED" && !isToday && (
        <div className={styles.lockedTag}>
          <Lock size={13} /> Locked
        </div>
      )}

      {status === "LOCKED" && isToday && (
        <div className={styles.lockedTag}>
          <Lock size={13} /> {formatted}
        </div>
      )}

      {status === "AVAILABLE" && isToday && (
        <button className={styles.claimBtn} onClick={onClaim} disabled={claiming}>
          {claiming ? "Claiming…" : "Claim Now"}
        </button>
      )}

      {status === "MISSED" && <div className={styles.missedTag}>Missed</div>}
    </div>
  );
}
