export const WEEK_DAYS = [
  { key: "monday", label: "Segunda-feira", shortLabel: "Seg" },
  { key: "tuesday", label: "Terca-feira", shortLabel: "Ter" },
  { key: "wednesday", label: "Quarta-feira", shortLabel: "Qua" },
  { key: "thursday", label: "Quinta-feira", shortLabel: "Qui" },
  { key: "friday", label: "Sexta-feira", shortLabel: "Sex" },
  { key: "saturday", label: "Sabado", shortLabel: "Sab" },
  { key: "sunday", label: "Domingo", shortLabel: "Dom" },
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

export function createDefaultAvailability() {
  return WEEK_DAYS.map((day) => ({
    day: day.key,
    enabled: false,
    start: DEFAULT_START,
    end: DEFAULT_END,
  }));
}

export function normalizeAvailability(value) {
  if (Array.isArray(value)) {
    const defaults = createDefaultAvailability();

    return defaults.map((defaultDay) => {
      const found = value.find((item) => item.day === defaultDay.day);

      return found
        ? {
            day: defaultDay.day,
            enabled: Boolean(found.enabled),
            start: found.start || DEFAULT_START,
            end: found.end || DEFAULT_END,
          }
        : defaultDay;
    });
  }

  return createDefaultAvailability();
}

export function formatAvailabilitySummary(availability) {
  const normalized = normalizeAvailability(availability);

  return normalized
    .filter((item) => item.enabled)
    .map((item) => {
      const day = WEEK_DAYS.find((weekDay) => weekDay.key === item.day);
      return `${day?.shortLabel || item.day}: ${item.start} - ${item.end}`;
    })
    .join(" | ");
}

export function getDayKeyFromDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const keys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return keys[date.getDay()];
}

export function getAvailabilityForDate(availability, dateString) {
  if (!dateString) {
    return null;
  }

  const dayKey = getDayKeyFromDate(dateString);
  const normalized = normalizeAvailability(availability);

  return normalized.find((item) => item.day === dayKey) || null;
}

export function isDateAvailable(availability, dateString) {
  const entry = getAvailabilityForDate(availability, dateString);
  return Boolean(entry?.enabled);
}

export function isTimeWithinAvailability(availability, dateString, timeString) {
  const entry = getAvailabilityForDate(availability, dateString);

  if (!entry?.enabled || !timeString) {
    return false;
  }

  return timeString >= entry.start && timeString <= entry.end;
}

export function timeToMinutes(timeString) {
  if (!timeString || !timeString.includes(":")) {
    return null;
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) {
    return "";
  }

  const normalizedMinutes = Math.max(0, totalMinutes);
  const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
  const minutes = String(normalizedMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function addMinutesToTime(timeString, durationInMinutes) {
  const startMinutes = timeToMinutes(timeString);

  if (startMinutes === null || !Number.isFinite(durationInMinutes)) {
    return "";
  }

  return minutesToTime(startMinutes + durationInMinutes);
}

export function timeRangesOverlap(
  startATime,
  durationAMinutes,
  startBTime,
  durationBMinutes,
) {
  const startA = timeToMinutes(startATime);
  const startB = timeToMinutes(startBTime);

  if (
    startA === null ||
    startB === null ||
    !Number.isFinite(durationAMinutes) ||
    !Number.isFinite(durationBMinutes)
  ) {
    return false;
  }

  const endA = startA + durationAMinutes;
  const endB = startB + durationBMinutes;

  return startA < endB && endA > startB;
}

function roundMinutesUp(totalMinutes, stepInMinutes) {
  if (!Number.isFinite(totalMinutes) || !Number.isFinite(stepInMinutes)) {
    return null;
  }

  const remainder = totalMinutes % stepInMinutes;

  if (remainder === 0) {
    return totalMinutes;
  }

  return totalMinutes + stepInMinutes - remainder;
}

export function generateAvailableTimeSlots({
  availability,
  dateString,
  durationInMinutes,
  occupiedIntervals = [],
  minimumStartTime = "",
  stepInMinutes = 5,
}) {
  const entry = getAvailabilityForDate(availability, dateString);
  const availabilityStart = timeToMinutes(entry?.start);
  const availabilityEnd = timeToMinutes(entry?.end);
  const minimumStartMinutes = minimumStartTime
    ? timeToMinutes(minimumStartTime)
    : null;

  if (
    !entry?.enabled ||
    availabilityStart === null ||
    availabilityEnd === null ||
    !Number.isFinite(durationInMinutes) ||
    durationInMinutes <= 0
  ) {
    return [];
  }

  const earliestStart = roundMinutesUp(
    Math.max(availabilityStart, minimumStartMinutes ?? availabilityStart),
    stepInMinutes,
  );
  const latestStart = availabilityEnd - durationInMinutes;

  if (earliestStart === null || earliestStart > latestStart) {
    return [];
  }

  const slots = [];

  for (
    let currentMinutes = earliestStart;
    currentMinutes <= latestStart;
    currentMinutes += stepInMinutes
  ) {
    const currentTime = minutesToTime(currentMinutes);
    const hasConflict = occupiedIntervals.some((interval) =>
      timeRangesOverlap(
        currentTime,
        durationInMinutes,
        interval.time,
        interval.durationMinutos,
      ),
    );

    if (!hasConflict) {
      slots.push(currentTime);
    }
  }

  return slots;
}

export function doesTimeRangeFitAvailability(
  availability,
  dateString,
  startTime,
  durationInMinutes,
) {
  const entry = getAvailabilityForDate(availability, dateString);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes =
    startMinutes === null || !Number.isFinite(durationInMinutes)
      ? null
      : startMinutes + durationInMinutes;
  const availabilityStart = timeToMinutes(entry?.start);
  const availabilityEnd = timeToMinutes(entry?.end);

  if (
    !entry?.enabled ||
    startMinutes === null ||
    endMinutes === null ||
    availabilityStart === null ||
    availabilityEnd === null
  ) {
    return false;
  }

  return startMinutes >= availabilityStart && endMinutes <= availabilityEnd;
}
