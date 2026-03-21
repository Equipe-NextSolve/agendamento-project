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

function legacyAvailabilityToSchedule(value) {
  const schedule = createDefaultAvailability();

  if (value === "Seg a Sex - Manha") {
    return schedule.map((item) =>
      ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
        item.day,
      )
        ? { ...item, enabled: true, start: "08:00", end: "12:00" }
        : item,
    );
  }

  if (value === "Seg a Sex - Tarde") {
    return schedule.map((item) =>
      ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
        item.day,
      )
        ? { ...item, enabled: true, start: "13:00", end: "18:00" }
        : item,
    );
  }

  if (value === "Sabado - Manha") {
    return schedule.map((item) =>
      item.day === "saturday"
        ? { ...item, enabled: true, start: "08:00", end: "12:00" }
        : item,
    );
  }

  return schedule;
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

  if (typeof value === "string") {
    return legacyAvailabilityToSchedule(value);
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
