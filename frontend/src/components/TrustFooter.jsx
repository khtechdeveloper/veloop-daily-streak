import React from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import styles from "./TrustFooter.module.css";

export default function TrustFooter() {
  return (
    <footer className={styles.footer}>
      <ShieldCheck size={18} color="var(--vl-gold)" />
      <span>
        Official rewards only on <strong>VeloopRewards.in</strong> · Stay active, stay rewarded!
      </span>
      <ChevronRight size={16} />
    </footer>
  );
}
