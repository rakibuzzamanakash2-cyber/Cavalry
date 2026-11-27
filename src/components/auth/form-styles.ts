// Form classes ported from Ru'sAuth (src/app/component/formStyles.ts), using
// CAVALRY's colour tokens instead of fixed colours.

export const primaryButtonClass =
  "bg-primary border-primary text-primary-foreground hover:text-primary flex w-full cursor-pointer items-center justify-center gap-2 border py-2.5 text-sm font-medium transition-colors hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "border-line text-ink hover:border-primary hover:text-primary flex w-full cursor-pointer items-center justify-center gap-2 border py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const linkClass = "text-primary text-sm font-medium transition-colors hover:underline";
export const fieldWrapperClass =
  "border-line bg-surface text-muted focus-within:border-primary focus-within:text-primary flex items-center gap-2 border px-3 py-2.5 transition-colors";
export const fieldInputClass =
  "text-ink placeholder:text-muted w-full min-w-0 bg-transparent text-sm outline-none";
