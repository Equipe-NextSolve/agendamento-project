export function PrimaryButton({ children, type = "button" }) {
  return (
    <button
      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-greendark text-sm font-semibold text-white transition hover:bg-greendark/90 focus:outline-none"
      type={type}
    >
      {children}
    </button>
  );
}
