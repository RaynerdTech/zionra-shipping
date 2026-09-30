export default function GetQuoteLoading() {
  return (
    <main className="min-h-screen bg-neutral-01 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[1272px] animate-pulse">
        <div className="h-16 rounded bg-primary-08" />
        <div className="mt-8 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="h-[620px] rounded bg-white" />
          <div className="space-y-4"><div className="h-[190px] rounded bg-white" /><div className="h-[190px] rounded bg-white" /><div className="h-[190px] rounded bg-white" /></div>
        </div>
      </div>
    </main>
  );
}
