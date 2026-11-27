// Ported from Ru'sAuth (src/app/component/OrDivider.tsx).
export function OrDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`${className} text-muted flex items-center gap-3 text-xs leading-none`.trim()}>
      <div className="bg-line h-px flex-1" />
      <span className="font-semibold">OR</span>
      <div className="bg-line h-px flex-1" />
    </div>
  );
}
