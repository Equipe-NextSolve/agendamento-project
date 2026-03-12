const badgeStyles = {
  confirmado: "bg-greendark text-white",
  pendente: "bg-greenlight text-bluedark",
  concluido: "bg-bluelight text-white",
  cancelado: "bg-bluedark text-white",
};

export function StatusBadge({ value }) {
  const tone = badgeStyles[value] ?? "bg-bluelight text-white";

  return (
    <span
      className={`inline-flex h-8 min-w-24 items-center justify-center rounded-md text-xs font-semibold uppercase tracking-wide ${tone}`}
    >
      {value}
    </span>
  );
}
