export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTimeString(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function isToday(dateString, referenceDate = new Date()) {
  return dateString === getLocalDateString(referenceDate);
}

export function isDateTimeInPast(
  dateString,
  timeString,
  referenceDate = new Date(),
) {
  if (!dateString || !timeString) {
    return false;
  }

  const today = getLocalDateString(referenceDate);

  if (dateString < today) {
    return true;
  }

  if (dateString > today) {
    return false;
  }

  return timeString < getLocalTimeString(referenceDate);
}
