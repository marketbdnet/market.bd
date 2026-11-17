/**
 * Formats a post date/time into a human-friendly real-time string
 * (e.g. "এইমাত্র", "৫ মিনিট আগে", "২ ঘণ্টা আগে", "আজ ১০:৩০ AM", "গতকাল", etc.)
 */

export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, w => bnDigits[Number(w)]);
}

export function formatPostedAt(postedAt: string | number | Date, language: 'bn' | 'en' = 'bn'): string {
  if (!postedAt) return language === 'bn' ? 'এইমাত্র' : 'Just now';

  let dateObj: Date;
  if (typeof postedAt === 'number') {
    dateObj = new Date(postedAt);
  } else if (postedAt instanceof Date) {
    dateObj = postedAt;
  } else {
    // String cleanup
    const cleaned = String(postedAt)
      .replace(/\(Bikroy Live\)/gi, '')
      .replace(/Bikroy Live/gi, '')
      .trim();
    dateObj = new Date(cleaned);
  }

  // If invalid date, return clean string or "Just now"
  if (isNaN(dateObj.getTime())) {
    return language === 'bn' ? 'এইমাত্র' : 'Just now';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Time components
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? (language === 'bn' ? 'PM' : 'PM') : (language === 'bn' ? 'AM' : 'AM');
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  const timeStrBn = `${toBengaliNumber(formattedHours)}:${toBengaliNumber(minutes)} ${ampm}`;
  const timeStrEn = `${formattedHours}:${minutes} ${ampm}`;

  // Within 1 minute
  if (diffSecs < 60) {
    return language === 'bn' ? 'এইমাত্র' : 'Just now';
  }

  // Within 60 minutes
  if (diffMins < 60) {
    return language === 'bn'
      ? `${toBengaliNumber(diffMins)} মিনিট আগে`
      : `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }

  // Within 24 hours
  if (diffHours < 24) {
    // Check if it was today
    const isToday = now.toDateString() === dateObj.toDateString();
    if (isToday) {
      if (diffHours <= 6) {
        return language === 'bn'
          ? `${toBengaliNumber(diffHours)} ঘণ্টা আগে`
          : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      }
      return language === 'bn' ? `আজ, ${timeStrBn}` : `Today, ${timeStrEn}`;
    }
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === dateObj.toDateString();
  if (isYesterday || (diffHours >= 24 && diffHours < 48)) {
    return language === 'bn' ? `গতকাল, ${timeStrBn}` : `Yesterday, ${timeStrEn}`;
  }

  // Within last 7 days
  if (diffDays < 7) {
    return language === 'bn'
      ? `${toBengaliNumber(diffDays)} দিন আগে`
      : `${diffDays} days ago`;
  }

  // Formatted date for older
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  const monthIdx = dateObj.getMonth();

  if (language === 'bn') {
    return `${toBengaliNumber(day)} ${monthsBn[monthIdx]}, ${timeStrBn}`;
  }
  return `${day} ${monthsEn[monthIdx]} ${year}, ${timeStrEn}`;
}

/**
 * Formats an exact post date & time (e.g. "১৭ নভে ২০২৬, ০৭:১২ AM" / "17 Nov 2026, 07:12 AM")
 * so every recent listing explicitly shows what date and time it was posted.
 */
export function formatPostDateTime(
  postedAt: string | number | Date | undefined,
  language: 'bn' | 'en' = 'bn'
): string {
  if (!postedAt) {
    const now = new Date();
    return formatExactDateAndTime(now, language);
  }

  let dateObj: Date;
  if (typeof postedAt === 'number') {
    dateObj = new Date(postedAt);
  } else if (postedAt instanceof Date) {
    dateObj = postedAt;
  } else {
    const cleaned = String(postedAt)
      .replace(/\(Bikroy Live\)/gi, '')
      .replace(/Bikroy Live/gi, '')
      .trim();
    dateObj = new Date(cleaned);
  }

  if (isNaN(dateObj.getTime())) {
    const fallback = typeof postedAt === 'string' ? postedAt.trim() : '';
    return fallback || (language === 'bn' ? 'এইমাত্র' : 'Just now');
  }

  return formatExactDateAndTime(dateObj, language);
}

function formatExactDateAndTime(dateObj: Date, language: 'bn' | 'en'): string {
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBnShort = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'];

  const day = dateObj.getDate();
  const monthIdx = dateObj.getMonth();
  const year = dateObj.getFullYear();

  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  if (language === 'bn') {
    const datePart = `${toBengaliNumber(day)} ${monthsBnShort[monthIdx]} ${toBengaliNumber(year)}`;
    const timePart = `${toBengaliNumber(formattedHours)}:${toBengaliNumber(minutes)} ${ampm}`;
    return `${datePart}, ${timePart}`;
  }

  return `${day} ${monthsEn[monthIdx]} ${year}, ${formattedHours}:${minutes} ${ampm}`;
}

