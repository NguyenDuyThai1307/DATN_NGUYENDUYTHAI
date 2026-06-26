"use client";

import { useEffect, useMemo, useState } from "react";

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
  const initial = useMemo(() => getRemainingTime(endsAt), [endsAt]);
  const [remaining, setRemaining] = useState(initial);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemainingTime(endsAt)), 1_000);

    return () => window.clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1.5" aria-label="Thoi gian ket thuc flash sale">
      {[remaining.hours, remaining.minutes, remaining.seconds].map((value, index) => (
        <span key={index} className="rounded bg-zinc-950 px-2 py-1 text-xs font-bold text-white">
          {String(value).padStart(2, "0")}
        </span>
      ))}
    </div>
  );
}
