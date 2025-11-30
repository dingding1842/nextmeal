export function getGMT6Time(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const gmt6 = new Date(utc + (3600000 * 6));
  return gmt6;
}

export function canOrderLunch(): boolean {
  const gmt6Time = getGMT6Time();
  const hours = gmt6Time.getHours();
  return hours < 10;
}

export function canOrderDinner(): boolean {
  const gmt6Time = getGMT6Time();
  const hours = gmt6Time.getHours();
  return hours < 16;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
