export default function GetQuoteLoading() {
  return (
    <main className="min-h-[520px] bg-primary-10">
      <div className="h-[76px] animate-pulse bg-primary-08" />
      <div className="mx-auto w-full max-w-[1272px] animate-pulse px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="mb-2 h-4 w-24 rounded bg-white/15" />
              <div className="h-12 rounded-[10px] bg-white/90" />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 h-12 w-36 rounded-[8px] bg-primary-06" />
      </div>
    </main>
  );
}
