// Helper utility to calculate customer transaction duration on MarketBD.Net

export function getMarketBdTenure(memberSince?: string, language: 'bn' | 'en' = 'bn'): string {
  if (!memberSince) {
    return language === 'bn' ? '১ মাস ১৫ দিন থেকে অন MarketBD.Net' : '1 Month 15 Days on MarketBD.Net';
  }

  // Reference date (Current app context: July 2026)
  const now = new Date(2026, 6, 30); // July 30, 2026

  let startDate: Date;

  const trimmed = memberSince.trim();

  // If it's a 4-digit year like "2022", "2023", "2024"
  if (/^\d{4}$/.test(trimmed)) {
    const year = parseInt(trimmed, 10);
    startDate = new Date(year, 1, 15); // Feb 15 of that year
  } else if (!isNaN(Date.parse(trimmed))) {
    startDate = new Date(trimmed);
  } else {
    startDate = new Date(2023, 5, 10); // Default fallback
  }

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    days += 30;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const toBnNum = (num: number) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
  };

  const parts: string[] = [];

  if (years > 0) {
    if (language === 'bn') {
      parts.push(`${toBnNum(years)} বছর`);
    } else {
      parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    }
  }

  if (months > 0) {
    if (language === 'bn') {
      parts.push(`${toBnNum(months)} মাস`);
    } else {
      parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    }
  }

  if (years === 0 && months === 0) {
    const safeDays = Math.max(1, days);
    if (language === 'bn') {
      parts.push(`${toBnNum(safeDays)} দিন`);
    } else {
      parts.push(`${safeDays} ${safeDays === 1 ? 'Day' : 'Days'}`);
    }
  }

  const tenureText = parts.length > 0 ? parts.join(' ') : (language === 'bn' ? '১ মাস' : '1 Month');

  if (language === 'bn') {
    return `${tenureText} থেকে অন MarketBD.Net`;
  } else {
    return `${tenureText} on MarketBD.Net`;
  }
}
