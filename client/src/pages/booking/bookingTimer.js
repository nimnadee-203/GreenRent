// Simple booking timer that persists in localStorage per booking ID
const STORAGE_KEY_PREFIX = "booking_timer_";

export const startBookingTimer = (bookingId, durationMinutes = 15) => {
  if (!bookingId) return;
  const now = Date.now();
  const data = {
    bookingId,
    startAt: now,
    durationMs: durationMinutes * 60 * 1000,
    active: true,
  };
  localStorage.setItem(STORAGE_KEY_PREFIX + bookingId, JSON.stringify(data));
};

export const getBookingTimer = (bookingId) => {
  if (!bookingId) return null;
  const raw = localStorage.getItem(STORAGE_KEY_PREFIX + bookingId);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Invalid timer data", err);
    localStorage.removeItem(STORAGE_KEY_PREFIX + bookingId);
    return null;
  }
};

export const getRemainingBookingMs = (bookingId) => {
  const timer = getBookingTimer(bookingId);
  if (!timer || !timer.active) return 0;
  const elapsed = Date.now() - timer.startAt;
  const remaining = timer.durationMs - elapsed;
  return Math.max(0, remaining);
};

export const formatBookingRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const isBookingTimerExpired = (bookingId) => getRemainingBookingMs(bookingId) <= 0;

export const clearBookingTimer = (bookingId) => {
  localStorage.removeItem(STORAGE_KEY_PREFIX + bookingId);
};
