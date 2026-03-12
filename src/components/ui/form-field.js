export function fieldClassName() {
  return "h-11 w-full rounded-lg border border-bluelight/30 bg-white text-sm text-bluedark outline-none transition focus:border-greendark";
}

export function FormField({ label, htmlFor, children }) {
  return (
    <label className="flex w-full flex-col gap-2" htmlFor={htmlFor}>
      <span className="text-sm font-medium text-bluedark">{label}</span>
      {children}
    </label>
  );
}
