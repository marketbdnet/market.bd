/**
 * Responsive Auto-Adjust Grid Layout Helpers
 * Ensures zero trailing empty slots on Android/mobile (2-col), tablet (3/4-col), and desktop (4/5-col).
 */

export function getAutoAdjustedShowcaseCardClass(index: number, total: number): string {
  if (total <= 0) return 'flex';

  // Ideal case (>= 6 items available):
  // - Mobile (<640px, 2-col): shows 6 cards (2x3) -> 0 gaps
  // - Small Tablet (sm, 3-col): shows 6 cards (3x2) -> 0 gaps
  // - Medium Tablet (md, 4-col): shows 4 cards (4x1) -> 0 gaps
  // - Desktop (lg+, 5-col): shows 5 cards (5x1) -> 0 gaps
  if (total >= 6) {
    if (index === 4) return 'flex md:hidden lg:flex';
    if (index === 5) return 'flex md:hidden';
    if (index > 5) return 'hidden';
    return 'flex';
  }

  // Fallback when fewer than 6 active ads exist: stretch the final card cleanly across any remainder cells
  if (index !== total - 1) return 'flex';

  const classes: string[] = ['flex'];

  // Mobile 2-col
  if (total % 2 === 1) {
    classes.push('col-span-2');
  } else {
    classes.push('col-span-1');
  }

  // sm 3-col
  const rem3 = total % 3;
  if (rem3 === 1) classes.push('sm:col-span-3');
  else if (rem3 === 2) classes.push('sm:col-span-2');
  else classes.push('sm:col-span-1');

  // md 4-col (hide 5th on md so 4 fill row 1 cleanly, or span remaining cells if < 4)
  if (total === 5) {
    classes.push('md:hidden lg:flex');
  } else {
    const rem4 = total % 4;
    if (rem4 === 1) classes.push('md:col-span-4');
    else if (rem4 === 2) classes.push('md:col-span-3');
    else if (rem4 === 3) classes.push('md:col-span-2');
    else classes.push('md:col-span-1');
  }

  // lg 5-col
  const rem5 = total % 5;
  if (rem5 === 1) classes.push('lg:col-span-5');
  else if (rem5 === 2) classes.push('lg:col-span-4');
  else if (rem5 === 3) classes.push('lg:col-span-3');
  else if (rem5 === 4) classes.push('lg:col-span-2');
  else classes.push('lg:col-span-1');

  return classes.join(' ');
}

export function getAutoAdjustedRecentCardClass(index: number, total: number): string {
  if (total <= 0 || index !== total - 1) return '';

  const classes: string[] = [];

  // Mobile / sm: 2-col
  if (total % 2 === 1) {
    classes.push('col-span-2');
  } else {
    classes.push('col-span-1');
  }

  // md: 3-col
  const rem3 = total % 3;
  if (rem3 === 1) classes.push('md:col-span-3');
  else if (rem3 === 2) classes.push('md:col-span-2');
  else classes.push('md:col-span-1');

  // lg: 4-col
  const rem4 = total % 4;
  if (rem4 === 1) classes.push('lg:col-span-4');
  else if (rem4 === 2) classes.push('lg:col-span-3');
  else if (rem4 === 3) classes.push('lg:col-span-2');
  else classes.push('lg:col-span-1');

  return classes.join(' ');
}
