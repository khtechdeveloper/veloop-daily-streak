import React from "react";
import { AlertTriangle, X } from "lucide-react";
import styles from "./ErrorBanner.module.css";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={styles.banner}>
      <AlertTriangle size={16} />
      <span>{message}</span>
      <button className={styles.close} onClick={onDismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
