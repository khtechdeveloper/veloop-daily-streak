import React, { useCallback, useEffect, useState } from "react";
import styles from "./DailyStreak.module.css";
import StreakHeader from "../../components/StreakHeader.jsx";
import HeroBanner from "../../components/HeroBanner.jsx";
import StreakStats from "../../components/StreakStats.jsx";
import UltimateReward from "../../components/UltimateReward.jsx";
import RewardGrid from "../../components/RewardGrid.jsx";
import CpaDemo from "../../components/CpaDemo.jsx";
import StreakLoader from "../../components/StreakLoader.jsx";
import StreakSkeleton from "../../components/StreakSkeleton.jsx";
import WhyStreak from "../../components/WhyStreak.jsx";
import TrustFooter from "../../components/TrustFooter.jsx";
import ErrorBanner from "../../components/ErrorBanner.jsx";
import ResetBanner from "../../components/ResetBanner.jsx";
import { getStreak, claimStreak, getWallet } from "../../services/streakApi.js";

/**
 * Orchestrates the whole feature. This component never invents streak
 * state - every value shown comes from the most recent server response.
 * The only "local" state here is UI plumbing: which visual phase we're in
 * (initial load / skeleton / ready), whether the CPA demo overlay is
 * showing, and any error text to display.
 */
export default function DailyStreakPage() {
  const [phase, setPhase] = useState("loading"); // loading | ready
  const [streakData, setStreakData] = useState(null);
  const [gemBalance, setGemBalance] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [showCpaDemo, setShowCpaDemo] = useState(false);
  const [error, setError] = useState("");
  const [justReset, setJustReset] = useState(false);

  const fetchStatus = useCallback(async () => {
    const data = await getStreak();
    setStreakData(data);
    setJustReset(!!data.streak?.wasReset);
    return data;
  }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const wallet = await getWallet();
      setGemBalance(wallet.balances?.VES || 0);
    } catch {
      // Non-critical for rendering the streak itself.
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchStatus(), fetchWallet()]);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your streak. Please try again.");
      } finally {
        setPhase("ready");
      }
    })();
  }, [fetchStatus, fetchWallet]);

  // Called when a day's visual countdown hits zero - we ask the backend for
  // the real, authoritative status instead of assuming it's now claimable.
  const handleTimerComplete = useCallback(async () => {
    try {
      await fetchStatus();
    } catch {
      // Silent - next manual refresh or claim attempt will re-sync.
    }
  }, [fetchStatus]);

  async function handleClaim() {
    setError("");
    setClaiming(true);
    setShowCpaDemo(true);
  }

  // The CPA demo is purely a visual delay - the actual claim call fires once
  // it finishes, and the backend is the only thing that can grant the reward.
  async function handleCpaFinished() {
    try {
      await claimStreak();
      await Promise.all([fetchStatus(), fetchWallet()]);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to process your reward. Please try again.");
    } finally {
      setShowCpaDemo(false);
      setClaiming(false);
    }
  }

  if (phase === "loading") return <StreakLoader />;
  if (!streakData) {
    return (
      <div className={styles.page}>
        <StreakHeader gemBalance={gemBalance} />
        <div className={styles.container}>
          <ErrorBanner message={error || "Something went wrong."} onDismiss={() => setError("")} />
        </div>
      </div>
    );
  }

  const { streak, rewards, nextReward } = streakData;
  const ultimateReward = rewards.find((r) => r.day === 7);

  return (
    <div className={styles.page}>
      <StreakHeader gemBalance={gemBalance} />

      <div className={styles.container}>
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        {justReset && <ResetBanner />}

        <div className={styles.streakBadge}>🔥 {streak.currentStreak} Day Streak — Keep it going!</div>

        <HeroBanner />

        <StreakStats totalRewards={streak.totalRewards} checkedIn={streak.checkedIn} nextReward={nextReward} />

        {streakData ? (
          <UltimateReward
            reward={ultimateReward ? { ...ultimateReward.reward, day: 7 } : null}
            unlocked={ultimateReward?.status === "CLAIMED"}
          />
        ) : null}

        <p className={styles.comeBack}>✦ Come back tomorrow for more rewards! ✦</p>

        <RewardGrid
          rewards={rewards}
          onClaim={handleClaim}
          onTimerComplete={handleTimerComplete}
          claiming={claiming}
        />

        <WhyStreak />
        <TrustFooter />
      </div>

      {showCpaDemo && <CpaDemo onFinished={handleCpaFinished} />}
    </div>
  );
}
