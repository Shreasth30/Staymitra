export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <div className="h-80 w-full shrink-0 animate-pulse rounded-xl bg-muted lg:w-64" />
        <div className="grid flex-1 gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
