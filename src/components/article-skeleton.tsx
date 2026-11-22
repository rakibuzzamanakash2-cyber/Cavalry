/** Placeholder shown while a programme or news page loads its content. */
export function ArticleSkeleton({ narrow = false }: { narrow?: boolean }) {
  const bar = "bg-sand animate-pulse motion-reduce:animate-none";
  return (
    <div
      className={`mx-auto w-full px-4 pt-8 pb-16 sm:px-6 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className={`${bar} h-3 w-40`} />
      <div className={`${bar} mt-6 h-10 w-full max-w-2xl`} />
      <div className={`${bar} mt-3 h-10 w-2/3 max-w-xl`} />
      <div className={`${bar} mt-6 h-4 w-full max-w-3xl`} />
      <div className={`${bar} mt-2 h-4 w-5/6 max-w-3xl`} />
      <div className="border-line mt-10 space-y-3 border-t pt-10">
        <div className={`${bar} h-4 w-full`} />
        <div className={`${bar} h-4 w-11/12`} />
        <div className={`${bar} h-4 w-4/5`} />
      </div>
    </div>
  );
}
