export default function StayLoading() {
  return (
    <div className="animate-pulse pb-24">
      <div className="h-64 bg-muted" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="h-12 w-2/3 rounded-lg bg-muted" />
        <div className="mt-4 h-6 w-1/3 rounded bg-muted" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="h-64 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
