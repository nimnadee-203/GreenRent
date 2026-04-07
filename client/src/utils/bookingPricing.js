/** Align with server booking.service.js calculateTotalPrice (nights/months). */

export const getDailyRate = (property) =>
  Number(property?.dailyPrice ?? property?.price ?? 0);

export const getMonthlyRate = (property) =>
  Number(property?.monthlyPrice ?? property?.price ?? 0);

export const calculateNightsCeil = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return 0;
  return Math.max(1, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
};

export const calculateMonthsFromDates = (checkIn, checkOut) => {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return 0;
  const monthsDiff =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return Math.max(1, Math.ceil(monthsDiff));
};

export const formatLkr = (n) =>
  `Rs ${Number(n || 0).toLocaleString("en-LK")}`;
