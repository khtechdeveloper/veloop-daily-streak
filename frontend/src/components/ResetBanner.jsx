import React from "react";
import { RotateCcw } from "lucide-react";
import styles from "./ResetBanner.module.css";

export default function ResetBanner() {
  return (
    <div className={styles.banner}>
      <RotateCcw size={16} />
      <span>Your streak was reset because a reward window was missed. Starting fresh from Day 1!</span>
    </div>
  );
}
