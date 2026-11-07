export interface AutoApprovalTimerResult {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  progressPercent: number;
  formatted: string;
  formattedBn: string;
}

export function getRemainingAutoApproveTime(postedAt: string, durationMinutes = 30): AutoApprovalTimerResult {
  const postedTime = new Date(postedAt).getTime();
  const now = Date.now();
  const targetTime = (isNaN(postedTime) ? now : postedTime) + durationMinutes * 60 * 1000;
  const diffMs = targetTime - now;

  if (diffMs <= 0 || isNaN(postedTime)) {
    return {
      minutes: 0,
      seconds: 0,
      isExpired: true,
      progressPercent: 100,
      formatted: '00:00',
      formattedBn: '০০ মিনিট ০০ সেকেন্ড (অটো-এপ্রুভ হচ্ছে...)'
    };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSecs / 60);
  const seconds = totalSecs % 60;
  const elapsedMs = now - postedTime;
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / (durationMinutes * 60 * 1000)) * 100));

  const pad = (n: number) => n.toString().padStart(2, '0');
  const padBn = (n: number) => n.toString().padStart(2, '0').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);

  const minutesBn = padBn(minutes);
  const secondsBn = padBn(seconds);

  return {
    minutes,
    seconds,
    isExpired: false,
    progressPercent,
    formatted: `${pad(minutes)}:${pad(seconds)}`,
    formattedBn: `${minutesBn} মিনিট ${secondsBn} সেকেন্ড`
  };
}
