"use client";

import { useEffect, useState } from "react";

type FlashSaleCountdownProps = {
  endsAt: string;
};

function getRemainingTime(endsAt: string) {
  const distance = Math.max(0, new Date(endsAt).getTime() - Date.now());

  return {
    hours: Math.floor(distance / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1_000),
  };
}

export function FlashSaleCountdown({ endsAt }: FlashSaleCountdownProps) {
  const [remaining, setRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function updateRemainingTime() {
      setRemaining(getRemainingTime(endsAt));
    }

    const initialTimer = window.setTimeout(updateRemainingTime, 0);
    const timer = window.setInterval(updateRemainingTime, 1_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1.5" aria-label="Thời gian kết thúc flash sale">
      {[remaining.hours, remaining.minutes, remaining.seconds].map((value, index) => (
        <span key={index} className="rounded bg-zinc-950 px-2 py-1 text-xs font-bold text-white">
          {String(value).padStart(2, "0")}
        </span>
      ))}
    </div>
  );
}
