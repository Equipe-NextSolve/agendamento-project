export function PrimaryButton({
  children,
  className,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-greendark text-sm font-semibold text-white transition focus:outline-none ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : "cursor-pointer hover:bg-greendark/90"
      } ${className ?? ""}`}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
